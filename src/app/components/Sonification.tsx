"use client";
import { useEffect, useState, useContext } from "react";
import { csv } from "d3";

import * as Tone from "tone";
import { PlayerContext } from "../lib/utils";

let compressor = new Tone.Compressor(-30, 3).toDestination();
class Player {
  synth: any;
  notes: any;
  index: number;
  timeoutId: NodeJS.Timeout | null = null;
  delay: number;
  release: string;
  constructor(
    synth:
      | Tone.Synth<Tone.SynthOptions>
      | Tone.FMSynth
      | Tone.PolySynth
      | Tone.MonoSynth,

    notes: number[] | string[],
    release = "0.2",
    delay = 500
  ) {
    this.synth = synth;
    this.notes = notes;
    this.index = 0;
    this.timeoutId = null;
    this.release = release;
    this.delay = delay;
  }

  getRandomNote() {
    if (this.notes.length > 0) {
      return this.notes[this.index];
    }
    return "";
  }

  getRandomRelease() {
    return this.release;
  }

  playNoteRandom(releaseMin = 0.2, releaseMax = 0.5) {
    let note = this.getRandomNote();
    let release = Math.random() * (releaseMax - releaseMin) + releaseMin;
    this.synth.triggerAttackRelease(note, release);
    this.timeoutId = setTimeout(
      () => this.playNoteRandom(releaseMin, releaseMax),
      this.delay
    );
  }

  playNoteSequence() {
    let note = this.getRandomNote();
    this.synth.triggerAttackRelease(note, "8n", undefined, 0.6);
    this.index = (this.index + 1) % this.notes.length;
    this.timeoutId = setTimeout(() => this.playNoteSequence(), this.delay);
  }

  stopNoteSequence() {
    this.synth.triggerRelease();

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }
  }

  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.synth.dispose();
  }
}
const Sonification = () => {
  const playerContext = useContext(PlayerContext);

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
    });

    let yeast_delay = new Tone.PingPongDelay({
      delayTime: "4n",
      feedback: 0.2,
      wet: 0.2,
    });

    yeast_synth.connect(yeast_delay);
    yeast_delay.toDestination();

    let yeast = new Player(yeast_synth, yeast_notes, "8n", 250);

    let mold_synth = new Tone.Synth();

    let mold_delay = new Tone.PingPongDelay({
      delayTime: "8n",
      feedback: 0.7,
    }).chain(compressor);

    mold_synth.connect(mold_delay);
    mold_delay.toDestination();

    let mold = new Player(mold_synth, scaleNotes, "8n", 500);

    const synth1 = new Tone.MonoSynth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 },
    }).toDestination();

    const synth2 = new Tone.MonoSynth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 },
    }).toDestination();

    const synth3 = new Tone.MonoSynth({
      oscillator: { type: "square" },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 },
    }).toDestination();

    // Define notes for each player
    const notes1 = ["E2", "A2", "B2"]; // LAB5
    const notes2 = ["E2", "G#2", "B2"]; // AAB7
    const notes3 = ["A2", "B2", "E3"]; // bacilli5

    // Define different delays for each player to create a rhythmic pattern
    const delay1 = 250; // LAB5 plays every quarter second (16th note)
    const delay2 = 500; // AAB7 plays every half second (8th note)
    const delay3 = 750; // bacilli5 plays every three-quarters of a second

    // Create three players
    const acetic_acid_bacteria = new Player(synth1, notes3, "8n", delay1);
    const bacilli = new Player(synth2, notes2, "8n", delay2);
    const lactic_acid_bacteria = new Player(synth3, notes1, "8n", delay3);

    setPlayers({
      lactic_acid_bacteria,
      mold,
      yeast,
      acetic_acid_bacteria,
      bacilli,
    });

    setLoaded(true);
  }, [data]);

  return <></>;
};

export default Sonification;
