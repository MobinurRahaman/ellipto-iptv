import { useState } from "react";
import { useParams } from "react-router-dom";
import { Player, Hls, DefaultUi } from "@vime/react";
import "@vime/core/themes/default.css";
import Dexie from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

// Create database and playlist store/collection
const db = new Dexie("IPTV");
db.version(1).stores({
  playlists: "++id,&name,data",
});

export default function LiveTv() {
  const { channelId } = useParams();
  const [currentChannelData, setCurrentChannelData] = useState([]);

  useLiveQuery(() => {
    db.open().then(() => {
      db.playlists.toArray().then((result) => {
        setCurrentChannelData(
          result[0].data.filter((item) => item.tvg.id === channelId)[0]
        );
      });
    });
  }, [channelId]);

  /**
   * @see https://hls-js.netlify.app/api-docs/file/src/config.ts.html.
   */
  const hlsConfig = {
    // ...
  };

  return (
    <>
      <Player>
        <Hls version="latest" config={hlsConfig} poster="">
          <source
            data-src={currentChannelData?.url}
            type="application/x-mpegURL"
          />
        </Hls>
        <DefaultUi />
        {/* ... */}
      </Player>
    </>
  );
}
