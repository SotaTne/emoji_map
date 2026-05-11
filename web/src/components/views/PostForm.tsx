import { useState } from "react";
import { EmojiPickerComponent } from "../ui/emoji_picker";
import { SendButton } from "../ui/send_button";
import { createPost } from "../../lib/db";
import type { Post } from "@emoji-map/shared";

interface PostFormProps {
  location: Post["location"] | null;
  userId?: string;
  onSuccess?: () => void;
}

export function PostForm({ location, userId, onSuccess }: PostFormProps) {
  const [emoji, setEmoji] = useState("😀");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createPost({
        emoji,
        mood: text,
        location,
        userId,
      });
      setText("");
      setEmoji("😀");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute bottom-5 left-1/2 z-[1000] flex w-[calc(100%-24px)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-black/5 bg-white/95 px-3 py-2.5 shadow-[0_16px_40px_rgba(15,23,42,0.18)] backdrop-blur-md md:w-[340px]"
    >
      <EmojiPickerComponent
        key={emoji}
        defaultEmoji={emoji}
        onEmojiSelect={setEmoji}
        size={36}
        className="rounded-xl bg-[var(--color-accent-bg)] text-[17px] shadow-inner"
      />
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 text-[9px] font-semibold tracking-[0.08em] text-[var(--color-accent)]">
          TODAY'S MOOD
        </div>
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={
            location ? "今の気持ちを一言..." : "地図をタップして場所を選択"
          }
          className="block h-5 w-full bg-transparent text-[13px] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-sub)]"
        />
      </div>
      <SendButton disabled={isSubmitting || !location || !text.trim()} />
    </form>
  );
}
