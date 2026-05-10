import { Map } from "@vis.gl/react-google-maps";
import { Suspense } from "react";
import { EmojiPickerComponent } from "../ui/emoji_picker";

export function MyMap() {
  return (
    <Suspense fallback={<div>on loading</div>}>
      <Map
        style={{ width: "100vw", height: "100vh" }}
        defaultCenter={{ lat: 22.54992, lng: 0 }}
        defaultZoom={3}
        gestureHandling="greedy"
        disableDefaultUI
      />
      <div style={{ position: "absolute", top: "10px", left: "10px" }}>
        <EmojiPickerComponent onEmojiSelect={(emoji) => console.log(emoji)} />
      </div>
    </Suspense>
  );
}
