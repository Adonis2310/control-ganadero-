interface CattleIconProps {
  className?: string;
}

/**
 * Ícono de marca (cabeza de toro) dibujado a mano. Lucide no incluye un
 * ícono de ganado, así que este complementa el set en el mismo estilo
 * (trazo, viewBox 24x24) solo para el branding del login.
 */
export function CattleIcon({ className }: CattleIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 7.2C6.6 6.4 5 4.3 5.4 2.1 7.5 2.3 9.1 4 9.4 6.2" />
      <path d="M15 7.2c2.4-.8 4-2.9 3.6-5.1-2.1.2-3.7 1.9-4 4.1" />
      <path d="M7.6 8.8c-1-.4-1.9-.1-2.4.7" />
      <path d="M16.4 8.8c1-.4 1.9-.1 2.4.7" />
      <path d="M8.2 9.3C7 10.2 6.4 11.7 6.6 13.4c.3 2.4 1.7 4.3 2.3 5.4.4.8 1.3 1.2 3.1 1.2s2.7-.4 3.1-1.2c.6-1.1 2-3 2.3-5.4.2-1.7-.4-3.2-1.6-4.1-1.1-.8-2.4-1.1-3.8-1.1s-2.7.3-3.8 1.1Z" />
      <path d="M10.2 17h3.6" />
    </svg>
  );
}
