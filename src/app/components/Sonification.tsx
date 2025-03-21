"use client";
import { useEffect, useState, useContext, useRef } from "react";
import { csv } from "d3";

import * as Tone from "tone";
import { PlayerContext } from "../lib/PlayerContext";
import { Player } from "../lib/Classes";

const Sonification = () => {
  const playerContext = useContext(PlayerContext);
  const [initialized, setInitialized] = useState(false);
  const compressorRef = useRef<Tone.Compressor | null>(null);
  const limiterRef = useRef<Tone.Limiter | null>(null);
  const volumeRef = useRef<Tone.Volume | null>(null);

  if (!playerContext) {
    throw new Error("Sonification must be used within a PlayerProvider");
  }

  const { state, dispatch } = useContext(PlayerContext);
  const { players } = state;

  const [data, setData] = useState({});

  useEffect(() => {
    csv("/data/full_data.csv")
      .then((data) => {
        setData(
          data.map((d) =>
            d && d.organisms
              ? {
                  ...d,
                  category: d.category
                    .split(",")
                    .map((category) => category.trim()),
                }
              : d
          )
        );
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    // Instantiate Tone.js objects and store them in the refs
    compressorRef.current = new Tone.Compressor({
      threshold: -30,
      ratio: 3,
      attack: 0.1,
      release: 0.4,
    });

    limiterRef.current = new Tone.Limiter(-6);
    volumeRef.current = new Tone.Volume(-30);

    // Set up the signal chain using the .current property of the refs
    const compressor = compressorRef.current;
    const limiter = limiterRef.current;
    const volume = volumeRef.current;

    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    console;
    // Use the objects for creating synths
    if (compressorRef.current && limiterRef.current && volumeRef.current) {
      const setupAudioComponents = async () => {
        let scaleNotes = ["E3", "G3", "A3", "B3", "D4", "E4"]; // E minor pentatonic scale

        let yeast_notes = Tone.Frequency("E4")
          .harmonize([0, 2, 4, 7, 9])
          .map((freq) => freq.valueOf());

        let yeast_synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: "sine",
          },
          envelope: {
            attack: 0.05,
            decay: 0.1,
            sustain: 0.3,
            release: 1,
          },
          volume: -10,
        });

        let yeast_delay = new Tone.PingPongDelay({
          delayTime: "8n",
          feedback: 0.2,
          wet: 0.2,
        });

        let mold_volume = new Tone.Volume(-10);
        yeast_synth.connect(yeast_delay);
        yeast_synth.chain(
          // compressorRef.current,
          // limiterRef.current,
          // volumeRef.current,
          Tone.Destination
        );

        let yeast = new Player(
          "yeast",
          "Yeast",
          yeast_synth,
          yeast_notes,
          "8n",
          250
        );

        let mold_synth = new Tone.Synth();

        let mold_delay = new Tone.PingPongDelay({
          delayTime: "8n",
          feedback: 0.7,
        });

        mold_synth.connect(mold_delay);
        mold_synth.chain(mold_volume);
        mold_delay.toDestination();

        let mold = new Player(
          "mold",
          "Mold",
          mold_synth,
          scaleNotes,
          "8n",
          500
        );

        const AAB_synth = new Tone.MonoSynth({
          oscillator: { type: "triangle" },
          envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 },
          volume: -6,
        }).toDestination();

        // AAB_synth.chain(mold_volume, Tone.Destination);

        const bacilli_synth = new Tone.MonoSynth({
          oscillator: { type: "sine" },
          envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 },
          volume: -6,
        }).toDestination();

        const LAB_synth = new Tone.MonoSynth({
          oscillator: { type: "square" },
          envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 },
          volume: -8,
        }).toDestination();

        const LAB_notes = ["E2", "A2", "B2"]; // LAB
        const bacilli_notes = ["E2", "G#2", "B2"]; // AAB
        const AAB_notes = ["A2", "B2", "E3"]; // bacilli

        const AAB_delay = 250; // LAB plays every quarter second (16th note)
        const bacilli_delay = 500; // AAB plays every half second (8th note)
        const LAB_delay = 750; // bacilli plays every three-quarters of a second

        const acetic_acid_bacteria = new Player(
          "acetic_acid_bacteria",
          "Acetic Acid Bacteria",
          AAB_synth,
          AAB_notes,
          "8n",
          AAB_delay
        );
        const bacilli = new Player(
          "bacilli",
          "Bacilli",
          bacilli_synth,
          bacilli_notes,
          "8n",
          bacilli_delay
        );
        const lactic_acid_bacteria = new Player(
          "lactic_acid_bacteria",
          "Lactic Acid Bacteria",
          LAB_synth,
          LAB_notes,
          "8n",
          LAB_delay
        );

        let noise = new Tone.NoiseSynth({
          noise: {
            type: "brown",
          },
          envelope: {
            attack: 0,
            decay: 0.1,
            sustain: 0.3,
          },
          volume: -20,
        });

        let filter = new Tone.Filter({
          type: "highpass",
          frequency: 1000, // higher cutoff frequency
          Q: 5, // higher Q factor
        });

        let lfo = new Tone.LFO({
          frequency: "2n",
          type: "triangle",
          min: 500,
          max: 3000,
        });

        lfo.connect(filter.frequency);
        noise.connect(filter).toDestination();

        const other_synth = new Tone.MonoSynth({
          oscillator: { type: "fatsine" },
          envelope: { attack: 0.1, decay: 0.2, sustain: 0.2, release: 1.5 },
          volume: -10,
        });

        const other_filter = new Tone.Filter(5000, "lowpass").toDestination();
        other_synth.connect(other_filter);
        const other = new Player(
          "other",
          "Other",
          other_synth,
          ["E3"],
          "8n",
          0
        );

        dispatch({
          type: "SET_PLAYERS",
          payload: {
            lactic_acid_bacteria,
            mold,
            yeast,
            acetic_acid_bacteria,
            bacilli,
            other,
          },
        });
      };
      setupAudioComponents();
    }
  }, [initialized, data, dispatch]);

  return <></>;
};

export default Sonification;
