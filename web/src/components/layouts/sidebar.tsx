import { Menu } from "lucide-react";
import { useState } from "react";
import { SidebarContent } from "./sidebar_content";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="absolute left-4 top-4 z-[1000] flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[var(--color-text)] shadow-[0_10px_24px_rgba(15,23,42,0.16)] md:hidden"
      >
        <Menu size={19} />
      </button>

      <div className="absolute inset-y-0 left-0 z-[900] hidden md:block">
        <SidebarContent />
      </div>

      {isOpen && (
        <div className="absolute inset-0 z-[1200] md:hidden">
          <button
            type="button"
            aria-label="サイドバーを閉じる"
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute inset-y-0 left-0">
            <SidebarContent onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
