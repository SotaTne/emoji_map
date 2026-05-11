import type { Post } from "@emoji-map/shared";

function shortText(text: string) {
  return text.length > 5 ? `${text.slice(0, 5)}...` : text;
}

function formatPostDateTime(createdAt: Post["createdAt"]) {
  const date =
    createdAt && typeof createdAt.toDate === "function"
      ? createdAt.toDate()
      : null;

  if (!(date instanceof Date)) return "";

  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function PostPin({
  post,
  selected = false,
}: {
  post: Post;
  selected?: boolean;
}) {
  const dateLabel = formatPostDateTime(post.createdAt);

  return (
    <div className="flex cursor-pointer flex-col items-center">
      {selected ? (
        <div className="mb-1.5 w-[180px] rounded-2xl border border-black/5 bg-white p-2.5 shadow-[0_16px_36px_rgba(15,23,42,0.2)]">
          <div className="mb-1.5 text-[10px] font-medium text-[var(--color-text-sub)]">
            {dateLabel}
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-xl leading-none">{post.emoji}</span>
            <p className="min-w-0 text-[12px] leading-4 text-[var(--color-text)]">
              {post.mood}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-1 rounded-full border border-black/5 bg-white/95 px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-subtle)] shadow-[0_7px_14px_rgba(15,23,42,0.12)]">
          {shortText(post.mood)}
        </div>
      )}
      <div className="relative h-10 w-8 drop-shadow-[0_7px_10px_rgba(15,23,42,0.2)]">
        <svg viewBox="0 0 36 44" className="h-10 w-8" aria-hidden="true">
          <path
            d="M18 43C18 43 34 26.5 34 16.5C34 7.4 26.8 1 18 1C9.2 1 2 7.4 2 16.5C2 26.5 18 43 18 43Z"
            fill="white"
            stroke="#d7d9e0"
            strokeWidth="1.5"
          />
        </svg>
        <span className="absolute left-1/2 top-[8px] -translate-x-1/2 text-[17px] leading-none">
          {post.emoji}
        </span>
      </div>
    </div>
  );
}
