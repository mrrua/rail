#!/usr/bin/env bash
# Pull latest code into /opt/rail and restart.
# Uses the SSH keys of the login user who runs sudo (same as initial_deploy.sh).
#
#   sudo /opt/rail/update.sh
set -euo pipefail

# ---------------------------------------------------------------------------
# Config — keep in sync with initial_deploy.sh
# ---------------------------------------------------------------------------
APP_DIR="/opt/rail"
APP_USER="rail"
DOMAIN="rail.patat.one"
GIT_BRANCH=""          # empty = stay on current branch
SKIP_GIT=0
# ---------------------------------------------------------------------------

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

DEPLOY_USER="${SUDO_USER:-}"
if [[ -z "${DEPLOY_USER}" || "${DEPLOY_USER}" == "root" ]]; then
  echo "Run via sudo from your normal login user so git can use that account's ~/.ssh keys." >&2
  exit 1
fi

if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  echo "User ${APP_USER} does not exist. Run initial_deploy.sh first." >&2
  exit 1
fi

if [[ ! -f "${APP_DIR}/.env" ]]; then
  echo "Missing ${APP_DIR}/.env — run initial_deploy.sh first." >&2
  exit 1
fi

DEPLOY_HOME="$(getent passwd "${DEPLOY_USER}" | cut -d: -f6)"

git_as_deploy() {
  sudo -u "${DEPLOY_USER}" -H env \
    HOME="${DEPLOY_HOME}" \
    GIT_SSH_COMMAND="ssh -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" \
    git "$@"
}

echo "==> Updating ${APP_DIR}"
if [[ "${SKIP_GIT}" != "1" ]]; then
  if [[ ! -d "${APP_DIR}/.git" ]]; then
    echo "Not a git checkout at ${APP_DIR}." >&2
    exit 1
  fi
  if [[ ! -d "${DEPLOY_HOME}/.ssh" ]]; then
    echo "No ${DEPLOY_HOME}/.ssh for ${DEPLOY_USER}." >&2
    exit 1
  fi
  echo "    git as ${DEPLOY_USER} (keys in ${DEPLOY_HOME}/.ssh)"
  chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"
  git_as_deploy -C "${APP_DIR}" fetch --prune
  if [[ -n "${GIT_BRANCH}" ]]; then
    git_as_deploy -C "${APP_DIR}" checkout "${GIT_BRANCH}"
  fi
  # Deploy box should match remote exactly — discard local drift so pull never
  # aborts mid-update. Ignored files such as .env are left in place.
  BRANCH="$(git_as_deploy -C "${APP_DIR}" rev-parse --abbrev-ref HEAD)"
  git_as_deploy -C "${APP_DIR}" reset --hard "origin/${BRANCH}"
  git_as_deploy -C "${APP_DIR}" clean -fd
  chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"
  chmod 640 "${APP_DIR}/.env"
else
  echo "    SKIP_GIT=1 — not pulling"
fi

echo "==> Installing dependencies and building"
sudo -u "${APP_USER}" bash -c "set -a && . '${APP_DIR}/.env' && set +a && cd '${APP_DIR}' && npm ci && npm run build"

echo "==> Refreshing systemd unit"
if [[ -f "${APP_DIR}/deploy/rail.service" ]]; then
  sed \
    -e "s#User=rail#User=${APP_USER}#" \
    -e "s#Group=rail#Group=${APP_USER}#" \
    -e "s#/opt/rail#${APP_DIR}#g" \
    "${APP_DIR}/deploy/rail.service" > /etc/systemd/system/rail.service
fi
systemctl daemon-reload
systemctl enable rail.service >/dev/null 2>&1 || true

if [[ -f "${APP_DIR}/deploy/nginx.conf.template" ]]; then
  echo "==> Refreshing nginx site (HTTP only)"
  sed \
    -e "s#__SERVER_NAME__#${DOMAIN}#g" \
    "${APP_DIR}/deploy/nginx.conf.template" > /etc/nginx/sites-available/rail
fi

echo "==> Restarting service"
systemctl restart rail.service
systemctl --no-pager --full status rail.service | sed -n '1,12p'

echo "==> Reloading nginx"
nginx -t
systemctl reload nginx

echo
echo "Update complete."
echo "  Web: curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/"
