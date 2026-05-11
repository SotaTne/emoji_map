import { ArrowRight } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

type SendButtonProps = ComponentPropsWithoutRef<"button">;

export function SendButton({ className = "", ...props }: SendButtonProps) {
  return (
    <button
      type="submit"
      className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white shadow-[0_8px_18px_rgba(107,92,231,0.34)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-[#d8dbe3] disabled:shadow-none ${className}`}
      {...props}
    >
      <ArrowRight size={17} aria-hidden="true" />
      <span className="sr-only">投稿する</span>
    </button>
  );
}
