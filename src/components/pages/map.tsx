import { Map } from "@vis.gl/react-google-maps";
import { Suspense } from "react";
import { EmojiTextBoxComponent } from "../ui/emoji_text_box";

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
        <EmojiTextBoxComponent
          placeholder="今の気持ちは？"
          onChange={(a, b) => {
            console.log(a, b);
          }}
        />
      </div>
    </Suspense>
  );
}
