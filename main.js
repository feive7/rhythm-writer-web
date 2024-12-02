const inputBox = document.getElementById("pattern");
const { Renderer, Stave, StaveNote, Voice, Formatter, Beam, BarNote, Dot, Tremolo, Articulation, Glyphs, TextNote, TextDynamics, GraceNote, Tuplet, StaveTie} = Vex.Flow;
const VF = Vex.Flow;
const div = document.getElementById("output");
const renderer = new Renderer(div, Renderer.Backends.SVG);
renderer.resize(window.innerWidth, 200);
const context = renderer.getContext();
var currentPattern = inputBox.value;
var simplifiedPattern = [];
function check(strInput, what) {
  switch(what) {
    case("TimeSignature"): const TimeSignature = /^\d+\/\d+$/g; return strInput.match(TimeSignature);
    case("ValidBeat"): const ValidBeat = /^\d+[^\/\n]*$/g; return strInput.match(ValidBeat);
    case("IsBeat"): const IsBeat = /^\d+[^~\-\n\d]*$/g; return strInput.match(IsBeat);
    case("IsTuplet"): const IsTuplet = /(\d+-)+\d+/g; return strInput.match(IsTuplet);
    case("IsTie"): const IsTie = /(\d+[a-z]*~)+\d+/g; return strInput.match(IsTie);
    case("IsRoll"): const IsRoll = /^\d+t+$/g; return strInput.match(IsRoll);
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
      default: console.log(modifier); break;
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
  }
}
function randompattern(measures = 1) {
  var pattern = "";
  const options = ["1", "2", "4", "8 8", "8 16 16", "8d 16", "16 16 16 16", "16 16 8", "16 8 16"];
  for(var i = 0; i < measures; i++) {
    var ticks = 0;
    while(ticks < 16384) {
      const random = Math.floor(Math.random() * options.length);
      const pick = options[random];
      const beats = pick.split(" ");
      var noteTicks = 0;
      beats.forEach((beat) => {
        const pickedNote = get_note_from_beat(beat);
        noteTicks += pickedNote.intrinsicTicks;
      });
      if(ticks + noteTicks <= 16384) {
        ticks += noteTicks;
        pattern += pick + " ";
      }
    }
  }
  return pattern;
}
function draw(context, pattern = currentPattern) {
  const tuplets = [];
  const ties = [];
  const stave = new Stave(10, 40, window.innerWidth - 50);
  stave.addClef("percussion");
  const notes = [];
  const beamnotes = [];
  const beats = pattern.split(" ");
  var tick = 0;
  var notenumber = 0;
  var capture = {start: 0, end: 0, type: ''};
  beats.forEach((beat, number) => {
    if(check(beat, "IsBeat")) {
      //If the beat is perfectly parseable by get_note_from_beat()
      const stavenote = get_note_from_beat(beat);
      notes.push(stavenote);
    }
    else if(beat.includes('~')) {
      const tiedBeats = beat.split("~");
      capture.start = notes.length;
      capture.end = notes.length + tiedBeats.length - 1;
      console.log("Start: %i\nEnd: %i\nLength: %i\nType: %s", capture.start,capture.end,capture.end-capture.start,capture.type);
      tiedBeats.forEach((tiedBeat) => {
        if(check(tiedBeat, "IsBeat")) {
          const stavenote = get_note_from_beat(tiedBeat);
          notes.push(stavenote);
        }
        else {
          const barline = new BarNote();
          notes.push(barline);
        }
      });
      for(var i = 0; i < capture.end - capture.start; i++) {
        const tie = new StaveTie({
          first_note: notes[capture.start + i],
          last_note: notes[capture.start + i + 1],
          first_indices: [0],
          last_indices: [0],
        });
        ties.push(tie);
      }
    }
    else if(beat.includes('-')) {
      const tupletBeats = beat.split("-");
      capture.start = notes.length;
      capture.end = notes.length + tupletBeats.length;
      console.log("Start: %i\nEnd: %i\nLength: %i\nType: %s", capture.start,capture.end,capture.end-capture.start,capture.type);
      tupletBeats.forEach((tupletBeat) => {
        const stavenote = get_note_from_beat(tupletBeat);
        notes.push(stavenote);
      });
      const tupletNotes = notes.slice(capture.start,capture.end);
      const tuplet = new Tuplet(tupletNotes);
      tuplets.push(tuplet);
    }
    else {
      console.log(beat);
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
