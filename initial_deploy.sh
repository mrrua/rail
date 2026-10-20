#!/usr/bin/env bash
# Standalone first-time install for Ubuntu 24.04.
# Copy ONLY this file to the server. It clones into /opt/rail using
# YOUR login user's SSH keys (the account you sudo from).
#
#   chmod +x initial_deploy.sh
#   sudo ./initial_deploy.sh
#
# TLS/Let's Encrypt is handled by the upstream nginx forwarder.
# This box serves HTTP on port 80 only.
set -euo pipefail

# ---------------------------------------------------------------------------
# Config — edit here, do not pass on the command line
# ---------------------------------------------------------------------------
GIT_URL="git@github.com:mrrua/rail.git"
DOMAIN="rail.patat.one"
PUBLIC_URL="https://rail.patat.one"
APP_DIR="/opt/rail"
APP_USER="rail"
GIT_BRANCH=""          # empty = remote default branch
# ---------------------------------------------------------------------------

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

if [[ "$(. /etc/os-release && echo "${ID}")" != "ubuntu" ]]; then
  echo "This script targets Ubuntu 24.04." >&2
  exit 1
fi

DEPLOY_USER="${SUDO_USER:-}"
if [[ -z "${DEPLOY_USER}" || "${DEPLOY_USER}" == "root" ]]; then
  echo "Run via sudo from your normal login user so we can use that account's ~/.ssh keys." >&2
  exit 1
fi
DEPLOY_HOME="$(getent passwd "${DEPLOY_USER}" | cut -d: -f6)"
if [[ -z "${DEPLOY_HOME}" || ! -d "${DEPLOY_HOME}/.ssh" ]]; then
  echo "No ${DEPLOY_HOME}/.ssh for ${DEPLOY_USER}. Add a GitHub deploy key there first." >&2
  exit 1
fi

git_as_deploy() {
  sudo -u "${DEPLOY_USER}" -H env \
    HOME="${DEPLOY_HOME}" \
    GIT_SSH_COMMAND="ssh -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" \
    git "$@"
}

export DEBIAN_FRONTEND=noninteractive

echo "==> Installing OS packages"
apt-get update -y
apt-get install -y \
  ca-certificates \
  curl \
  git \
  openssh-client \
  build-essential \
  nginx \
  ufw

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  echo "==> Creating service user ${APP_USER}"
  useradd --system --create-home --home-dir "/home/${APP_USER}" --shell /usr/sbin/nologin "${APP_USER}"
fi

echo "==> Cloning ${GIT_URL} into ${APP_DIR} (SSH keys: ${DEPLOY_USER})"
if [[ -d "${APP_DIR}/.git" ]]; then
  echo "    Repo already present — fetching"
  chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"
  git_as_deploy -C "${APP_DIR}" fetch --prune
  if [[ -n "${GIT_BRANCH}" ]]; then
    git_as_deploy -C "${APP_DIR}" checkout "${GIT_BRANCH}"
  fi
  BRANCH="$(git_as_deploy -C "${APP_DIR}" rev-parse --abbrev-ref HEAD)"
  git_as_deploy -C "${APP_DIR}" reset --hard "origin/${BRANCH}"
elif [[ ! -e "${APP_DIR}" ]] || [[ -z "$(ls -A "${APP_DIR}" 2>/dev/null)" ]]; then
  mkdir -p "${APP_DIR}"
  chown "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"
  if [[ -n "${GIT_BRANCH}" ]]; then
    git_as_deploy clone --branch "${GIT_BRANCH}" "${GIT_URL}" "${APP_DIR}"
  else
    git_as_deploy clone "${GIT_URL}" "${APP_DIR}"
  fi
else
  echo "${APP_DIR} exists and is not a git checkout. Move it aside and re-run." >&2
  exit 1
fi

echo "==> Handing ${APP_DIR} to service user ${APP_USER}"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

ENV_FILE="${APP_DIR}/.env"
if [[ ! -f "${ENV_FILE}" ]]; then
  echo "==> Writing ${ENV_FILE}"
  sudo -u "${APP_USER}" tee "${ENV_FILE}" >/dev/null <<EOF
NEXT_PUBLIC_SITE_URL=${PUBLIC_URL}
EOF
else
  echo "==> Keeping existing .env"
fi
chmod 640 "${ENV_FILE}"

echo "==> Installing npm dependencies and building"
sudo -u "${APP_USER}" bash -c "set -a && . '${ENV_FILE}' && set +a && cd '${APP_DIR}' && npm ci && npm run build"

echo "==> Installing systemd unit"
sed \
  -e "s#User=rail#User=${APP_USER}#" \
  -e "s#Group=rail#Group=${APP_USER}#" \
  -e "s#/opt/rail#${APP_DIR}#g" \
  "${APP_DIR}/deploy/rail.service" > /etc/systemd/system/rail.service
systemctl daemon-reload
systemctl enable rail.service
systemctl restart rail.service

echo "==> Installing nginx site (HTTP only; TLS is upstream)"
sed \
  -e "s#__SERVER_NAME__#${DOMAIN}#g" \
  "${APP_DIR}/deploy/nginx.conf.template" > /etc/nginx/sites-available/rail
ln -sfn /etc/nginx/sites-available/rail /etc/nginx/sites-enabled/rail
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl reload nginx

if command -v ufw >/dev/null 2>&1; then
  echo "==> Allowing SSH + HTTP in UFW (will not enable UFW if it is inactive)"
  ufw allow OpenSSH >/dev/null 2>&1 || true
  ufw allow 'Nginx HTTP' >/dev/null 2>&1 || true
  if ufw status | grep -q "Status: inactive"; then
    echo "    UFW is inactive — not enabling it automatically."
  fi
fi

echo
echo "Initial deploy finished."
echo "  Public URL:  ${PUBLIC_URL}"
echo "  Code:        ${APP_DIR}"
echo "  Git/SSH:     ${DEPLOY_USER} (${DEPLOY_HOME}/.ssh)"
echo "  This nginx:  HTTP :80  (TLS on your other forwarder)"
echo
echo "Next:"
echo "  1. Point upstream nginx at this host:80 for ${DOMAIN}"
echo "  2. Later updates: sudo ${APP_DIR}/update.sh"
