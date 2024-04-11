"use client";
import { useEffect, useState, useContext, useRef } from "react";
import { csv } from "d3";

import * as Tone from "tone";
import { PlayerContext } from "../lib/utils";

interface IPlayable {
  play(): void;
  stop(): void;
}

export class NoisePlayer implements IPlayable {
  synth: Tone.NoiseSynth;
  lfo: Tone.LFO;
  duration: string;
  timeoutId: NodeJS.Timeout | null = null;
  delay: number;

  constructor(
    synth: Tone.NoiseSynth,
    lfo: Tone.LFO,
    duration: string,
    delay: number = 500
  ) {
    this.synth = synth;
    this.lfo = lfo;
    this.duration = duration;
    this.delay = delay;
  }

  play(): void {
    this.playNoiseSequence();
  }

  stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.lfo.stop();
    this.synth.triggerRelease();
  }

  playNoiseSequence(): void {
    this.synth.triggerAttack();
    this.lfo.start();
  }
}

export class Player implements IPlayable {
  synth: Tone.Synth | Tone.FMSynth | Tone.PolySynth | Tone.MonoSynth;
  notes: Array<number | string>;
  index: number = 0;
  timeoutId: NodeJS.Timeout | null = null;
  delay: number;
  release: string;

  constructor(
    synth: Tone.Synth | Tone.FMSynth | Tone.PolySynth | Tone.MonoSynth,
    notes: Array<number | string>,
    release: string = "0.2",
    delay: number = 500
  ) {
    this.synth = synth;
    this.notes = notes;
    this.release = release;
    this.delay = delay;
  }

  play(): void {
    this.playNoteSequence();
  }

  stop(time?: number): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.synth.triggerRelease(time ? time : Tone.now());
  }

  playNoteSequence(): void {
    let note = this.notes[this.index++ % this.notes.length];
    this.synth.triggerAttackRelease(note, this.release, "+0.1");
    // Schedule the next note
    this.timeoutId = setTimeout(() => {
      this.playNoteSequence(); // Continue playing the next note in sequence
    }, this.delay);
  }
}

const Sonification = () => {
  const playerContext = useContext(PlayerContext);
  const [initialized, setInitialized] = useState(false);
  const compressorRef = useRef<Tone.Compressor | null>(null);
  const limiterRef = useRef<Tone.Limiter | null>(null);
  const volumeRef = useRef<Tone.Volume | null>(null);

  if (!playerContext) {
    throw new Error("Sonification must be used within a PlayerProvider");
  }

  const { players, setPlayers } = playerContext;

  const [isLoaded, setLoaded] = useState(false);
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
    // Instantiate your Tone.js objects and store them in the refs
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

    if (compressor && limiter && volume) {
      // Connect the components in your audio signal chain
      // Example: compressor.chain(limiter, volume, Tone.Destination);
    }

    // Signal that setup is complete
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;

    // Use the objects for creating synths
    // Make sure you check if the objects are not null before using them
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

        let yeast = new Player(yeast_synth, yeast_notes, "8n", 250);

        let mold_synth = new Tone.Synth();

        let mold_delay = new Tone.PingPongDelay({
          delayTime: "8n",
          feedback: 0.7,
        });

        mold_synth.connect(mold_delay);
        mold_synth.chain(mold_volume);
        mold_delay.toDestination();

        let mold = new Player(mold_synth, scaleNotes, "8n", 500);

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

        // LAB_synth.chain(volume, limiter, compressor, Tone.Destination);

        const LAB_notes = ["E2", "A2", "B2"]; // LAB
        const bacilli_notes = ["E2", "G#2", "B2"]; // AAB
        const AAB_notes = ["A2", "B2", "E3"]; // bacilli

        const AAB_delay = 250; // LAB plays every quarter second (16th note)
        const bacilli_delay = 500; // AAB plays every half second (8th note)
        const LAB_delay = 750; // bacilli plays every three-quarters of a second

        const acetic_acid_bacteria = new Player(
          AAB_synth,
          AAB_notes,
          "8n",
          AAB_delay
        );
        const bacilli = new Player(
          bacilli_synth,
          bacilli_notes,
          "8n",
          bacilli_delay
        );
        const lactic_acid_bacteria = new Player(
          LAB_synth,
          LAB_notes,
          "8n",
          LAB_delay
        );

        let noise = new Tone.NoiseSynth({
          noise: {
            type: "brown", // brown noise
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
          frequency: "2n", // slower frequency
          type: "triangle", // smoother waveform
          min: 500, // higher minimum frequency
          max: 3000, // higher maximum frequency
        });

        lfo.connect(filter.frequency);
        noise.connect(filter).toDestination();

        let other = new NoisePlayer(noise, lfo, "8n", 2000);

        let noiseSynth = new Tone.NoiseSynth({
          noise: {
            type: "white",
          },
          envelope: {
            attack: 0,
            decay: 0.1,
            sustain: 0.3,
          },
          volume: -10,
        }).toDestination();

        noiseSynth.connect(filter);

        setPlayers({
          lactic_acid_bacteria,
          mold,
          yeast,
          acetic_acid_bacteria,
          bacilli,
          other,
        });

        setLoaded(true);
      };

      setupAudioComponents();
    }
  }, [initialized, data]);

  return <></>;
};

export default Sonification;
