"use client";
import { useEffect, useCallback, useState } from "react";
import { csv } from "d3";

import * as Tone from "tone";

class Player {
  constructor(synth, notes) {
    this.synth = synth;
    this.notes = notes;
    this.index = 0;
    this.timeoutId = null;
  }

  playNoteRandom(releaseMin = 0.2, releaseMax = 0.5, delay = 500) {
    let note = this.getRandomNote();
    let release = this.getRandomRelease(releaseMin, releaseMax);
    this.synth.triggerAttackRelease(note, release);
    this.timeoutId = setTimeout(
      () => this.playNoteRandom(releaseMin, releaseMax, delay),
      delay
    );
  }

  playNoteSequence(delay = 500, release = "8n") {
    let note = this.notes[this.index];
    this.synth.triggerAttackRelease(note, release);
    this.index = (this.index + 1) % this.notes.length;
    this.timeoutId = setTimeout(
      () => this.playNoteSequence(delay, release),
      delay
    );
  }

  stop() {
    clearTimeout(this.timeoutId);
  }

  getRandomNote() {
    return this.notes[Math.floor(Math.random() * this.notes.length)];
  }

  getRandomRelease(min, max) {
    return Math.random() * (max - min) + min;
  }
}

const Sonification = () => {
  const [isLoaded, setLoaded] = useState(false);
  const [players, setPlayers] = useState({});
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
    console.log(data);

    let scaleNotes = ["E3", "G3", "A3", "B3", "D4", "E4"]; // E minor pentatonic scale
    let LAB_notes = ["C4", "D4"]; // LAB notes
    let yeast_notes = ["E4", "G4"]; // Changed to E and G in the 4th octave

    let mold = new Player(
      new Tone.Synth().connect(
        new Tone.PingPongDelay("8n", 0.7).toDestination()
      ),
      scaleNotes
    );
    let AAB = new Player(
      new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0, decay: 0, sustain: 0.2, release: 0.8 },
      }).toDestination(),
      scaleNotes
    );
    let LAB = new Player(
      new Tone.Synth().connect(new Tone.Reverb(1).toDestination()),
      LAB_notes
    );
    let yeast_synth = new Tone.Synth({
      oscillator: { type: "sine" }, // Changed to a sine wave oscillator
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1.5 }, // Adjusted the envelope
    });

    // Chain the synth with the limiter
    // yeast_synth.chain(limiter, Tone.Destination);

    let yeast = new Player(yeast_synth, yeast_notes);

    class BacilliPlayer extends Player {
      playNoteSequence(delay = 500) {
        let note = this.notes[this.index];
        this.synth.triggerAttackRelease(note, "1n"); // '1n' specifies a note duration of 1 beat
        this.index = (this.index + 1) % this.notes.length;
        this.timeoutId = setTimeout(() => this.playNoteSequence(delay), delay);
      }
    }

    let bacilli_synth = new Tone.FMSynth({
      envelope: {
        attack: 0.3,
        decay: 0.4,
        sustain: 0.5,
        release: 1.5,
      },
      modulationIndex: 1,
    }).toDestination();

    let bacilli = new BacilliPlayer(bacilli_synth, ["C4"]);
    let lactic_acid_bacteria_synth = new Tone.Synth().toDestination();

    let lactic_acid_bacteria = new Player(lactic_acid_bacteria_synth, [
      "C3",
      "D3",
    ]);

    // let bacilli_synth = new Tone.FMSynth({
    //   modulationIndex: 12.22,
    //   envelope: {
    //     attack: 0.01,
    //     decay: 0.2,
    //     sustain: 0.2,
    //     release: 1.5,
    //   },
    //   oscillator: {
    //     type: "sine",
    //   },
    // }).toDestination();

    // bacilli_synth.connect(new Tone.PingPongDelay("8n", 0.7).toDestination());
    // let bacilli = new Player(bacilli_synth, scaleNotes);

    setPlayers({ lactic_acid_bacteria, mold, yeast });
    setLoaded(true);
  }, []);

  const onStartClick = () => {
    Tone.start();
    Object.values(players).forEach((player) => player.playNoteSequence());
  };

  const onStopClick = () => {
    Object.values(players).forEach((player) => player.stop());
  };

  return (
    <div>
      <button disabled={!isLoaded} onClick={onStartClick}>
        Start
      </button>
      <button disabled={!isLoaded} onClick={onStopClick}>
        Stop
      </button>
    </div>
  );
};

//const [players, setPlayers] = useState({});

//setPlayers({ mold, AAB, LAB, yeast, yeast_noise });
export default Sonification;
