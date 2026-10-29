const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

const classesPath = path.join(
  process.cwd(),
  "src/app/lib/Classes.ts"
);

function loadClasses(toneMock) {
  const source = fs.readFileSync(classesPath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: classesPath,
  });

  const compiledModule = new Module(classesPath, module);
  compiledModule.filename = classesPath;
  compiledModule.paths = Module._nodeModulePaths(path.dirname(classesPath));
  compiledModule.require = (request) => {
    if (request === "tone") return toneMock;
    return Module.prototype.require.call(compiledModule, request);
  };
  compiledModule._compile(outputText, classesPath);
  return compiledModule.exports;
}

function createTransport() {
  const events = new Map();
  const cleared = [];
  let nextId = 1;

  return {
    events,
    cleared,
    transport: {
      scheduleRepeat(callback, interval, startTime) {
        const id = nextId++;
        events.set(id, { callback, interval, startTime });
        return id;
      },
      clear(id) {
        cleared.push(id);
        events.delete(id);
      },
    },
  };
}

test("Player schedules notes on the shared audio transport", () => {
  const { events, transport } = createTransport();
  const toneMock = { Transport: transport };
  const { Player } = loadClasses(toneMock);
  const attacks = [];
  const synth = {
    triggerAttackRelease(note, duration, time) {
      attacks.push({ note, duration, time });
    },
    triggerRelease() {},
  };

  let browserTimerCount = 0;
  const originalSetTimeout = global.setTimeout;
  global.setTimeout = () => {
    browserTimerCount += 1;
    return 1;
  };

  try {
    const player = new Player("yeast", "Yeast", synth, ["E4", "G4"], "8n", 250);
    player.play(12.5);

    assert.equal(browserTimerCount, 0, "audio must not use event-loop timers");
    assert.equal(events.size, 1);

    const event = [...events.values()][0];
    assert.equal(event.interval, 0.25);
    assert.equal(event.startTime, 12.5);

    event.callback(42.25);
    assert.deepEqual(attacks, [{ note: "E4", duration: "8n", time: 42.25 }]);
  } finally {
    global.setTimeout = originalSetTimeout;
  }
});

test("restarting and stopping a Player clears every scheduled sequence", () => {
  const { cleared, events, transport } = createTransport();
  const toneMock = { Transport: transport };
  const { Player } = loadClasses(toneMock);
  const synth = {
    triggerAttackRelease() {},
    triggerRelease() {},
  };
  const originalSetTimeout = global.setTimeout;
  global.setTimeout = () => 1;

  try {
    const player = new Player("mold", "Mold", synth, ["E3"], "8n", 500);
    player.play(4);
    player.play(8);
    player.stop(9);

    assert.deepEqual(cleared, [1, 2]);
    assert.equal(events.size, 0);
  } finally {
    global.setTimeout = originalSetTimeout;
  }
});
