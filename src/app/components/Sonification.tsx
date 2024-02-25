"use client";
import { useEffect, useState, useContext } from "react";
import { csv } from "d3";

import * as Tone from "tone";
import { PlayerContext } from "../lib/utils";

// let compressor = new Tone.Compressor(-40, 5);
let compressor = new Tone.Compressor({
  threshold: -30, // Increase the threshold
  ratio: 3, // Lower the ratio
  attack: 0.1, // Increase the attack
  release: 0.4, // Increase the release
});
let limiter = new Tone.Limiter(-6);
let volume = new Tone.Volume(-30);

// let noise = new Tone.Noise({
//   type: "brown", // brown noise
//   volume: -25, // lower volume
// });

// let filter = new Tone.Filter({
//   type: "highpass",
//   frequency: 1000, // higher cutoff frequency
//   Q: 5, // higher Q factor
// });

// let lfo = new Tone.LFO({
//   frequency: "2n", // slower frequency
//   type: "triangle",
//   min: 500,
//   max: 3000,
// });

// lfo.connect(filter.frequency);
// noise.connect(filter).toDestination();

// compressor.chain(limiter, Tone.Destination);

export class NoisePlayer {
  synth: Tone.NoiseSynth;
  lfo: Tone.LFO;
  duration: string;
  timeoutId: NodeJS.Timeout | null = null;
  delay: number;

  constructor(
    synth: Tone.NoiseSynth,
    lfo: Tone.LFO,
    duration: string,
    delay = 500
  ) {
    this.synth = synth;
    this.lfo = lfo;
    this.duration = duration;
    this.delay = delay;
  }

  playNoiseRandom() {
    this.synth.triggerAttack();
    this.lfo.start();
  }

  playNoiseSequence() {
    this.synth.triggerAttack();
    this.lfo.start();
  }

  stop() {
    this.lfo.stop();
    this.synth.triggerRelease();
  }
}

export class Player {
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

  playNoteSequence(callback: Function, activateNoiseAndLFO = false) {
    let note = this.notes[this.index++ % this.notes.length];

    // Check if synth is an instance of NoiseSynth
    if (this.synth instanceof Tone.NoiseSynth) {
      // Start the noise
      this.synth.triggerAttackRelease(note, this.release);
      // Stop the noise after the release time
    } else {
      // Play the note
      this.synth.triggerAttackRelease(note, this.release);
    }
    // let note = this.getRandomNote();
    this.synth.triggerAttackRelease(note, "8n", "+0.1", 0.6);
    this.index = (this.index + 1) % this.notes.length;
    this.timeoutId = setTimeout(() => {
      this.playNoteSequence(callback, activateNoiseAndLFO);
    }, this.delay);
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
  const [isPlaying, setIsPlaying] = useState(false);

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
      volume: -10,
    });

    let yeast_delay = new Tone.PingPongDelay({
      delayTime: "4n",
      feedback: 0.2,
      wet: 0.2,
    });

    let mold_volume = new Tone.Volume(-10);
    yeast_synth.connect(yeast_delay);
    yeast_synth.chain(
      volume,
      limiter,
      compressor,
      yeast_delay,
      Tone.Destination
    );
    // yeast_delay.toDestination();

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

    let lpf = new Tone.Filter({
      type: "lowpass",
      frequency: 1000, // Cutoff frequency
      rolloff: -12, // Slope of the filter. Can be -12, -24, -48 or -96 dB per octave.
      Q: 1, // Controls the width of the filter peak. Higher values make a narrower peak.
    });

    const AAB_synth = new Tone.MonoSynth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 },
      volume: -4,
    }).toDestination();

    // AAB_synth.chain(mold_volume, Tone.Destination);

    const bacilli_synth = new Tone.MonoSynth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 },
      volume: -4,
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

    // let filter = new Tone.Filter({
    //   type: "highpass",
    //   frequency: 200,
    //   Q: 1,
    // }).toDestination();

    // let lfo = new Tone.LFO({
    //   frequency: "4n",
    //   type: "sine",
    //   min: 200,
    //   max: 2000,
    // }).connect(filter.frequency);

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
  }, [data]);

  return <></>;
};

export default Sonification;
