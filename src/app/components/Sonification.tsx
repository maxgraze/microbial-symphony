"use client";
import { useEffect, useState, useContext } from "react";
import { csv } from "d3";

import * as Tone from "tone";
import { PlayerContext } from "../page";

let compressor = new Tone.Compressor(-30, 3).toDestination();
class Player {
  synth: any;
  notes: any;
  index: number;
  timeoutId: NodeJS.Timeout | null = null;
  getRandomNote: any;
  release: string;
  constructor(
    synth: Tone.Synth<Tone.SynthOptions> | Tone.FMSynth,
    notes: string[],
    release = "0.2"
  ) {
    this.synth = synth;
    this.notes = notes;
    this.index = 0;
    this.timeoutId = null;
    this.release = release;
  }

  getRandomRelease() {
    return this.release;
  }

  playNoteRandom(releaseMin = 0.2, releaseMax = 0.5, delay = 500) {
    let note = this.getRandomNote();
    let release = Math.random() * (releaseMax - releaseMin) + releaseMin;
    this.synth.triggerAttackRelease(note, release);
    this.timeoutId = setTimeout(
      () => this.playNoteRandom(releaseMin, releaseMax, delay),
      delay
    );
  }

  playNoteSequence(delay = 500) {
    let note = this.notes[this.index];
    this.synth.triggerAttackRelease(note, "1n"); // '1n' specifies a note duration of 1 beat
    this.index = (this.index + 1) % this.notes.length;
    this.timeoutId = setTimeout(() => this.playNoteSequence(delay), delay);
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

  // getRandomNote() {
  //   return this.notes[Math.floor(Math.random() * this.notes.length)];
  // }

  // getRandomRelease(releaseMin: number, releaseMax: number) {
  //   return Math.random() * (releaseMax - releaseMin) + releaseMin;
  // }
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
    let LAB_notes = ["C4", "D4"];
    let yeast_notes = ["E4", "G4"];

    let mold = new Player(
      new Tone.Synth().connect(
        new Tone.PingPongDelay("8n", 0.7).chain(compressor)
      ),
      scaleNotes
    );
    let acetic_acid_bacteria = new Player(
      new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0, decay: 0, sustain: 0.2, release: 0.8 },
        volume: -15,
      }).chain(compressor),
      scaleNotes
    );
    let LAB = new Player(
      new Tone.Synth().connect(new Tone.Reverb(1).chain(compressor)),
      LAB_notes
    );

    let yeast_synth = new Tone.Synth({
      //   oscillator: { type: "sine" },

      envelope: {
        attack: 0.001,
        decay: 0.1,
        release: 0.01,
      },
    }).chain(
      new Tone.Filter({
        type: "highpass",
        frequency: 1400,
      }),
      compressor
    );

    let yeast = new Player(yeast_synth, ["E4", "G4"]);

    // let yeast = new Player(yeast_synth, yeast_notes);

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
    }).chain(compressor);

    let bacilli = new BacilliPlayer(bacilli_synth, ["C4"]);
    // let lactic_acid_bacteria_synth = new Tone.Synth()
    //   .chain(
    //     new Tone.Filter({
    //       type: "lowpass",
    //       frequency: 800,
    //     })
    //   )
    //   .chain(compressor);
    // let lactic_acid_bacteria_notes = ["C3", "D3"];
    // let lactic_acid_bacteria = new Player(
    //   lactic_acid_bacteria_synth,
    //   lactic_acid_bacteria_notes
    // );

    let LAB_synth = new Tone.Synth({
      oscillator: {
        type: "sine",
      },
    }).toDestination();
    let lactic_acid_bacteria = new Player(LAB_synth, ["C3"], "0.1");

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

    setPlayers({
      lactic_acid_bacteria,
      mold,
      yeast,
      acetic_acid_bacteria,
      bacilli,
    });

    // setSelectedSynths({ mold });

    setLoaded(true);

    // let selected = players
    //   ? players.reduce((obj, player) => {
    //       let key = player.replace(/ /g, "_");
    //       if (synths[key]) {
    //         obj[key] = synths[key];
    //       }
    //       return obj;
    //     }, {})
    //   : "";
    // setSelectedSynths(selected);
  }, [data]);

  // Object.values(
  //   players.reduce((obj, player) => {
  //     let key = player.replace(/ /g, "_");
  //     if (synths[key]) {
  //       obj[key] = synths[key];
  //     }
  //     return obj;
  //   }, {})
  // ).forEach((player) => player.playNoteSequence());

  // const onStartClick = () => {
  //   Tone.start();
  //   // Object.values(selectedSynths).forEach((d) => d.playNoteSequence());
  //   if (players) {
  //     let organismSynths = players.map((player) => {
  //       return synths[player.replace(/ /g, "_")];
  //     });
  //     organismSynths.forEach((d) => {
  //       return d.playNoteSequence();
  //     });
  //   }
  // };

  // const onStopClick = () => {
  //   if (players) {
  //     players.forEach((player) => {
  //       synths[player.replace(/ /g, "_")].stop();
  //     });
  //   }
  // };

  return <></>;
};

//const [players, setPlayers] = useState({});

//setPlayers({ mold, AAB, LAB, yeast, yeast_noise });
export default Sonification;
