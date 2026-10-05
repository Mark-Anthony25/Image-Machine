export type IconName =
  | 'upload'
  | 'camera'
  | 'plus'
  | 'arrow'
  | 'up'
  | 'down'
  | 'close'
  | 'drag'
  | 'reset'
  | 'pixel'
  | 'color'
  | 'sun'
  | 'blur'
  | 'threshold'
  | 'edges'
  | 'lock'
  | 'book';
const paths: Record<IconName, string> = {
  upload: 'M12 16V3m-5 5 5-5 5 5M4 14v6h16v-6',
  camera: 'M3 7h4l2-3h6l2 3h4v13H3z M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  plus: 'M12 5v14M5 12h14',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  up: 'm6 14 6-6 6 6',
  down: 'm6 10 6 6 6-6',
  close: 'm6 6 12 12M18 6 6 18',
  drag: 'M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01',
  reset: 'M4 10a8 8 0 1 1 1 8M4 4v6h6',
  pixel: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  color: 'M12 3 4 11a8 8 0 1 0 16 0z M12 3v18',
  sun: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',
  blur: 'M7 4v16m5-16v16m5-16v16M3 8h18M3 16h18',
  threshold: 'M4 4h16v16H4zM12 4v16M4 8h8M4 12h8M4 16h8',
  edges: 'M3 8V3h5m8 0h5v5m0 8v5h-5m-8 0H3v-5M8 8h8v8H8z',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5zM12 14v3',
  book: 'M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1zM12 5v15',
};
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
