export function SelectedPin() {
  return (
    <div className="flex cursor-pointer flex-col items-center">
      <div className="mb-1 rounded-full bg-[var(--color-accent)] px-2.5 py-1 text-[11px] font-semibold text-white shadow-[0_8px_18px_rgba(107,92,231,0.26)]">
        ここに投稿
      </div>
      <div className="relative h-10 w-8 drop-shadow-[0_7px_10px_rgba(107,92,231,0.24)]">
        <svg viewBox="0 0 36 44" className="h-10 w-8" aria-hidden="true">
          <path
            d="M18 43C18 43 34 26.5 34 16.5C34 7.4 26.8 1 18 1C9.2 1 2 7.4 2 16.5C2 26.5 18 43 18 43Z"
            fill="#6b5ce7"
            stroke="white"
            strokeWidth="1.5"
          />
        </svg>
        <span className="absolute left-1/2 top-[7px] -translate-x-1/2 text-[19px] font-bold leading-none text-white">
          +
        </span>
      </div>
    </div>
  );
}
