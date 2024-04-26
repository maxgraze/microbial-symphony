import React, { useContext, useEffect, useRef } from "react";
import { PlayerContext } from "../lib/utils";
import { useAudioInitializer } from "../lib/hooks/useAudioInitializer";
import { Player, NoisePlayer } from "./Sonification";
import { IPlayable } from "../lib/types";

interface AudioManagerProps {
  children: React.ReactNode;
  onNodeInteract: (node: any) => void; // Callback to handle node interaction
}

const AudioManager: React.FC<AudioManagerProps> = ({
  children,
  onNodeInteract,
}) => {
  const { players, playersLoaded } = useContext(PlayerContext);
  const isAudioReady = useAudioInitializer();
  const playingSynths = useRef<IPlayable[]>([]);

  const stopAllSynths = () => {
    playingSynths.current.forEach((player) => {
      player.stop();
    });
    playingSynths.current.length = 0; // Clear the array after stopping all synths
  };

  const onStartClick = async (d: any) => {
    // Adapt the type of d as necessary
    if (!playersLoaded || !isAudioReady) {
      console.error("Audio is not ready or players are not loaded");
      return;
    }

    stopAllSynths(); // Stop any currently playing synths before starting new ones

    const newOrganisms = d.data.children.map((child: { type: string }) =>
      child.type.replace(/ /g, "_")
    );
    let organismSynths = newOrganisms
      .map((organism) => players[organism])
      .filter((player) => player);

    organismSynths.forEach((player) => {
      playingSynths.current.push(player);
      player.play();
    });
  };

  useEffect(() => {
    // Example usage of onNodeInteract, bind it to some event or interaction logic
    onNodeInteract(onStartClick);
  }, [onNodeInteract]);

  return <>{children}</>;
};

export default AudioManager;
