export function HeroRails() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <img
        src="/hero-bridgeport.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_35%] sm:object-[62%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-fog/92 via-fog/45 to-fog/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-fog/75 via-transparent to-fog/25" />
    </div>
  );
}
