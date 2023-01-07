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
  const [error, setError] = useState({ code: null, message: "" });

  useLiveQuery(() => {
    db.open().then(() => {
      db.playlists.toArray().then((result) => {
        const channelDataMatchesWithEmptyArrays = result.map((playlistItem) => {
          const channelDataMatchesWithEmptyArrays = playlistItem.data.find(
            (channelItem) => channelItem.tvg.id === channelId
          );
          return channelDataMatchesWithEmptyArrays
            ? [channelDataMatchesWithEmptyArrays]
            : [];
        });
        const channelDataMatches = channelDataMatchesWithEmptyArrays.find(
          (array) => array.length > 0
        );
        channelDataMatches
          ? setCurrentChannelData(channelDataMatches[0])
          : setError({
              code: 404,
              message: "No channel found for this channel id",
            });
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
      {error.message ? (
        <>{error.message}</>
      ) : (
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
      )}
    </>
  );
}
