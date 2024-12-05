const inputBox = document.getElementById("pattern");
const { Renderer, Stave, StaveNote, Voice, Formatter, Beam, BarNote, Dot, Tremolo, Articulation, Glyphs, TextNote, TextDynamics, GraceNote, Tuplet, StaveTie} = Vex.Flow;
const VF = Vex.Flow;
const div = document.getElementById("output");
const renderer = new Renderer(div, Renderer.Backends.SVG);
var debuglogs = true;
renderer.resize(window.innerWidth, 200);
const context = renderer.getContext();
var currentPattern = inputBox.value;
var simplifiedPattern = [];
console.debugPrint = function(data) {
  if(debuglogs) {
    console.log(data);
  }
}
function check(strInput, what) {
  switch(what) {
    case("IsTimeSignature"):
      const TimeSignature = /^\d+\/\d+$/g;
      return TimeSignature.test(strInput);
    case("ValidBeat"):
      const ValidBeat = /^\d+[^\/\n]*$/g;
      return ValidBeat.test(strInput);
    case("IsBeat"):
      const IsBeat = /^[-~]?\d+[^\-\d]*?[~-]?$/g;
      return IsBeat.test(strInput);
    case("IsTuplet"):
      const IsEmittingTuplet = /(\d+[a-z]*-)+\d+[a-z]*/g;
      return IsEmittingTuplet.test(strInput);
    case("IsEmittingTie"):
      const IsEmittingTie = /\d+[^\-\d]*~$/g;
      return IsEmittingTie.test(strInput);
    case("IsRecievingTie"):
      const IsRecievingTie = /~\d+[^\-\d]*$/g;
      return IsRecievingTie.test(strInput);
  }
}
function get(strInput, what) {
  console.log(strInput, what);
  switch(what) {
    case('beat'): const GetBeat = /(?<=^~*)\d+[^~\-\n\d]*(?=[~-]*$)/g; return strInput.match(GetBeat)[0];
  }
}
function get_note_from_beat(beat) {
  const duration = beat.match(/\d|[dr]/g).join('');
  var staveNote = new StaveNote({keys: ["c/5"], duration: duration, stem_direction: 1});
  const modifiers = beat.match(/(?!\d+)(.)\1*/g);
  if(modifiers) modifiers.forEach((modifier) => {
    switch(modifier[0]) {
      case("d"): Dot.buildAndAttach([staveNote]); break;
      case("t"): staveNote = staveNote.addModifier(new Tremolo(modifier.length)); break;
      case("^"): staveNote = staveNote.addModifier(new Articulation('a^')); break;
      case(">"): staveNote = staveNote.addModifier(new Articulation('a>')); break;
      case("<"): staveNote = staveNote.addModifier(new Articulation('a<')); break;
      case("."): staveNote = staveNote.addModifier(new Articulation('a.')); break;
      //default: console.log(modifier); break;
    }
  });
  return staveNote;
}
function addGlyph(stave, notes, glyph) {
  if(check(glyph, "TimeSignature")) {
    stave.addTimeSignature(glyph.match(/^\d+\/\d+$/g)[0]);
  }
  switch(glyph) {
    case("|"): tick = 0; const barline = new BarNote(); notes.push(barline); break;
    // dynamics
    case("ppp"): notes.push(new TextDynamics({text: "ppp", duration: "4"})); break;
    case("pp"): notes.push(new TextDynamics({text: "pp", duration: "4"})); break;
    case("p"): notes.push(new TextDynamics({text: "p", duration: "4"})); break;
    case("mp"): notes.push(new TextDynamics({text: "mp", duration: "4"})); break;
    case("mf"): notes.push(new TextDynamics({text: "mf", duration: "4"})); break;
    case("f"): notes.push(new TextDynamics({text: "f", duration: "4"})); break;
    case("ff"): notes.push(new TextDynamics({text: "ff", duration: "4"})); break;
    case("fff"): notes.push(new TextDynamics({text: "fff", duration: "4"})); break;
    // for some reason, you put in an unrecognized symbol, print it out
    default: console.debugPrint("unrecognized Character: " + glyph);
  }
}
function randompattern(measures = 1) {
  var pattern = "";
  const options = [
    {beats: "4", ticks: 4096},
    {beats: "8", ticks: 2048},
    {beats: "8-8-8", ticks: 4096},
    {beats: "16", ticks: 1024},
    {beats: "16", ticks: 1024},
  ];
  for(var i = 0; i < measures; i++) {
    var ticks = 0;
    while(ticks < 16384) {
      const random = Math.floor(Math.random() * options.length);
      const pick = options[random];
      const noteBeats = pick.beats;
      const noteTicks = pick.ticks;
      if(ticks + noteTicks <= 16384) {
        ticks += noteTicks;
        pattern += noteBeats + " ";
      }
    }
    if(i != measures - 1)
    pattern += "| "
  }
  return pattern;
}
function draw(context, pattern = currentPattern) {
  const tuplets = [];
  const ties = [];
  const stave = new Stave(10, 40, window.innerWidth - 50);
  stave.addClef("percussion");
  const notes = [];
  const beats = pattern.split(" ");
  var capture = {start: 0, end: 0, type: ''};
  beats.forEach((beat, beatnumber) => {
    if(check(beat, "IsBeat")) {
      //If the beat is perfectly parseable by get_note_from_beat()
      const stavenote = get_note_from_beat(beat);
      notes.push(stavenote);
    }
    if(check(beat, "IsRecievingTie")) {
      capture.end = notes.length - 1;
      //console.log("Start: %i\nEnd: %i\nLength: %i\nType: %s", capture.start,capture.end,capture.end-capture.start,capture.type);
      if(capture.start != capture.end) {
        const tie = new StaveTie({
          first_note: notes[capture.start],
          last_note: notes[capture.end],
          first_indices: [0],
          last_indices: [0],
        });
        ties.push(tie);
      }
      //console.log("tie from " + capture.start + " to " + capture.end);
    }
    if(check(beat, "IsEmittingTie")) {
      capture.start = notes.length - 1;
    }
    if(check(beat, "IsTuplet")) {
      //console.log("tuplet from " + capture.start + " to " + capture.end);
      const tupletBeats = beat.split("-");
      tupletBeats.forEach((tupletBeat, i) => {
        notes.push(get_note_from_beat(tupletBeat));
      });
      const tuplet = new Tuplet(notes.slice(notes.length - tupletBeats.length, notes.length));
      tuplets.push(tuplet);
    }
    if(check(beat, "IsTimeSignature")) {
      stave.addTimeSignature(beat);
    }
    if(/[\|pmf]/g.test(beat)) {
      addGlyph(stave, notes, beat);
    }
  });
  stave.setContext(context).draw();
  const beams = Beam.generateBeams(notes.flat(), {stem_direction: 1});
  Formatter.FormatAndDraw(context, stave, notes);
  beams.forEach((beam) => {
    beam.setContext(context).draw();
  });
  tuplets.forEach((tuplet) => {
    tuplet.setContext(context).draw();
  });
  ties.forEach((tie) => {
    tie.setContext(context).draw();
  });
  return stave;
}
function update(pattern = currentPattern) {
  context.rect(0,0,window.innerWidth,window.innerHeight,{stroke: 'none', fill: 'white'});
  inputBox.value = pattern;
  currentPattern = pattern;
  draw(context, pattern);
}

var stave = draw(context);
