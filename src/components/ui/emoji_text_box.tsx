import { useState, type ComponentPropsWithoutRef } from "react";
import { EmojiPickerComponent } from "./emoji_picker";

interface EmojiTextBoxProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "onChange"
> {
  onChange?: (emoji: string, text: string) => void;
  defaultEmoji?: string;
  height?: number | string;
  width?: number | string;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
}

export function EmojiTextBoxComponent({
  onChange,
  defaultEmoji = "😀",
  height = 40,
  width = "100%",
  containerClassName,
  containerStyle,
  style,
  className,
  ...props
}: EmojiTextBoxProps) {
  const [emoji, setEmoji] = useState(defaultEmoji);
  const [text, setText] = useState("");

  // 数値の場合はpxを付与、文字列（100%など）の場合はそのまま使用
  const boxHeight = typeof height === "number" ? `${height}px` : height;
  const boxWidth = typeof width === "number" ? `${width}px` : width;

  // EmojiPickerに渡す数値サイズ（heightが数値でない場合はデフォルト値を使用）
  const pickerSize = typeof height === "number" ? height - 8 : 32;

  const handleEmojiSelect = (newEmoji: string) => {
    setEmoji(newEmoji);
    onChange?.(newEmoji, text);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setText(newText);
    onChange?.(emoji, newText);
  };

  return (
    <div
      className={containerClassName}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#fff",
        height: boxHeight,
        width: boxWidth,
        boxSizing: "border-box",
        ...containerStyle,
      }}
    >
      <EmojiPickerComponent
        onEmojiSelect={handleEmojiSelect}
        defaultEmoji={emoji}
        size={pickerSize}
        style={{
          backgroundColor: "transparent",
          borderRadius: "4px",
          flexShrink: 0,
        }}
      />
      <input
        type="text"
        value={text}
        onChange={handleTextChange}
        className={className}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          fontSize: "1rem",
          padding: "0 8px",
          height: "100%",
          backgroundColor: "transparent",
          ...style,
        }}
        {...props}
      />
    </div>
  );
}
