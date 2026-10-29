"use client";

import { useContext, useEffect } from "react";
import * as Tone from "tone";
import { PlayerContext } from "../lib/PlayerContext";
import { Player } from "../lib/Classes";

const Sonification = () => {
  const { dispatch } = useContext(PlayerContext);

  useEffect(() => {
    const compressor = new Tone.Compressor({
      threshold: -30,
      ratio: 3,
      attack: 0.1,
      release: 0.4,
    });
    const limiter = new Tone.Limiter(-6);
    const masterVolume = new Tone.Volume(-6);
    compressor.chain(limiter, masterVolume, Tone.Destination);

    const yeastSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.05,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
      volume: -10,
    });
    const yeastDelay = new Tone.PingPongDelay({
      delayTime: "8n",
      feedback: 0.2,
      wet: 0.2,
    });
    yeastSynth.connect(yeastDelay);
    yeastDelay.connect(compressor);

    const moldSynth = new Tone.Synth();
    const moldDelay = new Tone.PingPongDelay({
      delayTime: "8n",
      feedback: 0.7,
    });
    const moldVolume = new Tone.Volume(-10);
    moldSynth.connect(moldDelay);
    moldDelay.connect(moldVolume);
    moldVolume.connect(compressor);

    const aceticAcidSynth = new Tone.MonoSynth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 },
      volume: -6,
    }).connect(compressor);

    const bacilliSynth = new Tone.MonoSynth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 },
      volume: -6,
    }).connect(compressor);

    const lacticAcidSynth = new Tone.MonoSynth({
      oscillator: { type: "square" },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 },
      volume: -8,
    }).connect(compressor);

    const otherFilter = new Tone.Filter(5000, "lowpass").connect(compressor);
    const otherSynth = new Tone.MonoSynth({
      oscillator: { type: "fatsine" },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.2, release: 1.5 },
      volume: -10,
    }).connect(otherFilter);

    const players = {
      yeast: new Player(
        "yeast",
        "Yeast",
        yeastSynth,
        Tone.Frequency("E4")
          .harmonize([0, 2, 4, 7, 9])
          .map((frequency) => frequency.valueOf()),
        "8n",
        250
      ),
      mold: new Player(
        "mold",
        "Mold",
        moldSynth,
        ["E3", "G3", "A3", "B3", "D4", "E4"],
        "8n",
        500
      ),
      acetic_acid_bacteria: new Player(
        "acetic_acid_bacteria",
        "Acetic Acid Bacteria",
        aceticAcidSynth,
        ["A2", "B2", "E3"],
        "8n",
        250
      ),
      bacilli: new Player(
        "bacilli",
        "Bacilli",
        bacilliSynth,
        ["E2", "G#2", "B2"],
        "8n",
        500
      ),
      lactic_acid_bacteria: new Player(
        "lactic_acid_bacteria",
        "Lactic Acid Bacteria",
        lacticAcidSynth,
        ["E2", "A2", "B2"],
        "8n",
        750
      ),
      other: new Player(
        "other",
        "Other",
        otherSynth,
        ["E3"],
        "8n",
        1000
      ),
    };

    dispatch({ type: "SET_PLAYERS", payload: players });

    const nodes = [
      otherSynth,
      otherFilter,
      lacticAcidSynth,
      bacilliSynth,
      aceticAcidSynth,
      moldSynth,
      moldDelay,
      moldVolume,
      yeastSynth,
      yeastDelay,
      compressor,
      limiter,
      masterVolume,
    ];

    return () => {
      Object.values(players).forEach((player) => player.stop());
      nodes.forEach((node) => node.dispose());
      dispatch({ type: "SET_PLAYERS", payload: {} });
    };
  }, [dispatch]);

  return null;
};

export default Sonification;
