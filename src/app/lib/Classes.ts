import * as Tone from "tone";

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
