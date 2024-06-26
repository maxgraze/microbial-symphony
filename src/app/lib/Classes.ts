import * as Tone from "tone";
import { IPlayable } from "./types";

export class NoisePlayer implements IPlayable {
  id: string;
  name: string;
  synth: Tone.NoiseSynth;
  lfo: Tone.LFO;
  duration: string;
  timeoutId: NodeJS.Timeout | null = null;
  delay: number;

  constructor(
    id: string,
    name: string,
    synth: Tone.NoiseSynth,
    lfo: Tone.LFO,
    duration: string,
    delay: number = 500
  ) {
    this.id = id;
    this.name = name;
    this.synth = synth;
    this.lfo = lfo;
    this.duration = duration;
    this.delay = delay;
  }

  play(startTime?: number): void {
    // Make startTime optional to match IPlayable
    if (typeof startTime === "number") {
      const timeUntilStart = startTime - Tone.now();
      this.timeoutId = setTimeout(() => {
        this.playNoiseSequence(); // Start playing the sequence
      }, timeUntilStart);
    } else {
      this.playNoiseSequence(); // Start immediately if no startTime is provided
    }
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
  name: string;
  id: string;

  constructor(
    id: string,
    name: string,
    synth: Tone.Synth | Tone.FMSynth | Tone.PolySynth | Tone.MonoSynth,
    notes: Array<number | string>,
    release: string = "0.2",
    delay: number = 500
  ) {
    this.id = id;
    this.name = name;
    this.synth = synth;
    this.notes = notes;
    this.release = release;
    this.delay = delay;
  }

  play(): void;
  play(startTime: number): void;
  play(startTime?: number): void {
    if (typeof startTime === "number") {
      const timeUntilStart = startTime - Tone.now();
      this.timeoutId = setTimeout(() => {
        this.playNoteSequence(); // Start playing the sequence
      }, timeUntilStart);
    } else {
      this.playNoteSequence(); // Start immediately
    }
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
