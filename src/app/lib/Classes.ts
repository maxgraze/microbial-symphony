import * as Tone from "tone";
import { IPlayable } from "./types";

export class NoisePlayer implements IPlayable {
  id: string;
  name: string;
  synth: Tone.NoiseSynth;
  lfo: Tone.LFO;
  duration: string;
  scheduleId: number | null = null;
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
    this.clearSchedule();
    if (typeof startTime === "number") {
      this.scheduleId = Tone.Transport.scheduleOnce((time) => {
        this.scheduleId = null;
        this.playNoiseSequence(time);
      }, startTime);
    } else {
      this.playNoiseSequence(Tone.now());
    }
  }

  stop(): void {
    this.clearSchedule();
    this.lfo.stop();
    this.synth.triggerRelease();
  }

  private clearSchedule(): void {
    if (this.scheduleId !== null) {
      Tone.Transport.clear(this.scheduleId);
      this.scheduleId = null;
    }
  }

  playNoiseSequence(time: number): void {
    this.synth.triggerAttack(time);
    this.lfo.start(time);
  }
}

export class Player implements IPlayable {
  synth: Tone.Synth | Tone.FMSynth | Tone.PolySynth | Tone.MonoSynth;
  notes: Array<number | string>;
  index: number = 0;
  scheduleId: number | null = null;
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

  play(startTime: number = Tone.Transport.seconds): void {
    this.clearSchedule();
    this.index = 0;

    const intervalSeconds = this.delay / 1000;
    if (intervalSeconds <= 0) {
      throw new Error(`Player ${this.id} requires a positive delay`);
    }

    this.scheduleId = Tone.Transport.scheduleRepeat(
      (time) => this.playNote(time),
      intervalSeconds,
      startTime
    );
  }

  stop(time?: number): void {
    this.clearSchedule();
    this.synth.triggerRelease(time ?? Tone.now());
  }

  private clearSchedule(): void {
    if (this.scheduleId !== null) {
      Tone.Transport.clear(this.scheduleId);
      this.scheduleId = null;
    }
  }

  private playNote(time: number): void {
    const note = this.notes[this.index++ % this.notes.length];
    this.synth.triggerAttackRelease(note, this.release, time);
  }
}
