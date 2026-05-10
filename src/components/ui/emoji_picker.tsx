import data from "@emoji-mart/data";
import i18n from "@emoji-mart/data/i18n/ja.json";
import Picker from "@emoji-mart/react";
import { Activity, useState, type ComponentPropsWithoutRef } from "react";

interface EmojiPickerProps extends ComponentPropsWithoutRef<"button"> {
  onEmojiSelect: (emoji: string) => void;
  defaultEmoji?: string;
  size?: number;
}

export function EmojiPickerComponent({
  onEmojiSelect,
  defaultEmoji = "😀",
  size = 48,
  style,
  className,
  ...props
}: EmojiPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(defaultEmoji);

  const handleEmojiSelect = (emojiData: any) => {
    const emoji = emojiData.native;
    setSelectedEmoji(emoji);
    onEmojiSelect(emoji);
    setShowPicker(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className={className}
        style={{
          fontSize: `${size / 2}px`,
          cursor: "pointer",
          userSelect: "none",
          padding: "4px",
          borderRadius: "8px",
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: `${size}px`,
          height: `${size}px`,
          border: "none",
          ...style,
        }}
        {...props}
      >
        {selectedEmoji}
      </button>

      <Activity mode={showPicker ? "visible" : "hidden"}>
        <div
          style={{
            position: "absolute",
            zIndex: 100,
            top: "100%",
            left: "0",
            marginTop: "8px",
          }}
        >
          <Picker
            data={data}
            i18n={i18n}
            onEmojiSelect={handleEmojiSelect}
            theme="light"
          />
        </div>
      </Activity>
    </div>
  );
}
