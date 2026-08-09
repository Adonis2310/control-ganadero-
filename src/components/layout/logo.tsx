export function Logo() {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- asset estático simple, no necesita optimización de next/image */}
      <img
        src="/images/bull-skull-logo.png"
        alt="Control Ganadero"
        className="size-8 object-contain"
      />
      <div className="flex flex-col leading-none">
        <span className="text-sm font-semibold">Control Ganadero</span>
        <span className="text-xs text-muted-foreground">Gestión de finca</span>
      </div>
    </div>
  );
}
