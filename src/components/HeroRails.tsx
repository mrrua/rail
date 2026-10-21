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
      <div className="absolute inset-0 bg-gradient-to-r from-fog from-30% via-fog/80 to-fog/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-fog via-fog/15 to-fog/35" />
    </div>
  );
}
