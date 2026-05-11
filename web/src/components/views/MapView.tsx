import { Map } from "@vis.gl/react-google-maps";
import { EmojiTextBoxComponent } from "../ui/emoji_text_box";
import { APIProvider } from "@vis.gl/react-google-maps";

export function MapView() {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        style={{ width: "100vw", height: "100vh" }}
        defaultCenter={{ lat: 35.6812, lng: 139.7671 }} // 東京をデフォルトに
        defaultZoom={13}
        gestureHandling="greedy"
        disableDefaultUI
      />
      <div style={{ position: "absolute", top: "10px", left: "10px" }}>
        <EmojiTextBoxComponent
          placeholder="今の気持ちは？"
          onChange={(emoji, text) => {
            console.log(emoji, text);
          }}
        />
      </div>
    </APIProvider>
  );
}
