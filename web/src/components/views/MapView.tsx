import type { Post } from "@emoji-map/shared";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { subscribePosts } from "../../lib/db";
import { PostPin } from "../ui/post_pin";
import { SelectedPin } from "../ui/selected_pin";
import { PostForm } from "./PostForm";
import { useAuthUser } from "../../hooks/useAuthUser";

const tokyoStation = { lat: 35.6812, lng: 139.7671 };

export function MapView() {
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
  const [selectedLocation, setSelectedLocation] = useState<
    Post["location"] | null
  >(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const user = useAuthUser();

  // React の外側にある Firestore のリアルタイム更新を、
  // React の state に同期するための処理。
  //
  // useEffect は画面に表示された後に実行されるので、
  // ここで Firestore の購読を開始する。
  //
  // 投稿データが届くたびに setPosts が呼ばれ、
  // React の state が更新されて画面のピンも再描画される。
  //
  // return した関数は、画面から外れたときに購読を止めるために使われる。
  useEffect(() => {
    return subscribePosts(setPosts);
  }, []);

  const handleMapClick = (event: MapMouseEvent) => {
    if (!event.detail.latLng) return;

    setSelectedPostId(null);
    setSelectedLocation(event.detail.latLng);
  };

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div className="relative h-full w-full">
        <Map
          style={{ width: "100%", height: "100%" }}
          defaultCenter={tokyoStation}
          defaultZoom={13}
          gestureHandling="greedy"
          disableDefaultUI
          mapId={mapId}
          onClick={handleMapClick}
        >
          {mapId &&
            posts.map((post) => (
              <AdvancedMarker
                key={post.id}
                position={post.location}
                onClick={() => {
                  const postId = post.id;
                  if (!postId) return;
                  setSelectedLocation(null);
                  setSelectedPostId((currentId) =>
                    currentId === postId ? null : postId,
                  );
                }}
              >
                <PostPin post={post} selected={selectedPostId === post.id} />
              </AdvancedMarker>
            ))}
          {mapId && selectedLocation && (
            <AdvancedMarker
              position={selectedLocation}
              onClick={() => setSelectedLocation(null)}
            >
              <SelectedPin />
            </AdvancedMarker>
          )}
        </Map>
        <PostForm
          location={selectedLocation}
          onSuccess={() => setSelectedLocation(null)}
          userId={user.user?.uid}
        />
      </div>
    </APIProvider>
  );
}
