import { useState, useEffect } from "react";
import * as Tone from "tone";

export const useAudioInitializer = () => {
  const [isAudioReady, setAudioReady] = useState(false);

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        if (Tone.context.state !== "running") {
          await Tone.start();
          console.log("Audio is ready");
          setAudioReady(true);
        }
      } catch (error) {
        console.error("Error starting Tone.js:", error);
        // Optionally set audio ready to false if initialization fails
        setAudioReady(false);
      }
    };

    initializeAudio();
  }, []);

  useEffect(() => {
    const handleStateChange = () => {
      if (Tone.context.state === "running") {
        setAudioReady(true);
      } else {
        setAudioReady(false);
      }
    };

    // Listen for changes in the state of the Tone.js context
    Tone.context.on("statechange", handleStateChange);

    // Cleanup function to remove the event listener
    return () => {
      Tone.context.off("statechange", handleStateChange);
    };
  }, []);

  return isAudioReady;
};
