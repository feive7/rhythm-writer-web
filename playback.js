const play_button = document.querySelector("#play-button");
const bpm_slider = document.querySelector("#bpm-slider");
const bpm_display = document.querySelector("#bpm-display");
function generate_strip(pattern) {
  const beats = pattern.split(" ");
  const tones = [];
  var capture = {start: 0, end: 0, type: ''};
  while(beats.length) {
    const beat = beats.pop();
    if(check(beat, "IsBeat")) {
      tones.push(get_tone_from_beat(beat));
    }
  }
  return tones;
}
function get_tone_from_beat(beat, mod = 1) {
  const length =  0.192;
  const duration = (get_note_from_beat(beat).intrinsicTicks / mod) * (0.015 / bpm_slider.value);
  const beats = get_note_from_beat(beat).intrinsicTicks / 4096
  if(check(beat, "IsRoll")) return {rest: (beat.includes("r") ? true : false), length: length / 10, duration: duration, repeat: 2 * beats * (beat.match(/t/g).length + 1)};
  return {rest: (beat.includes("r") ? true : false), length: length, duration: duration, repeat: 1};
}
function strip_beats(beats) {
  const beatArray = beats.split(" ");
  const durations = [];
  beatArray.forEach((beat) => {
    if(check(beat, "ValidBeat")) {
      if(check(beat, "IsBeat")) {
        durations.push(get_tone_from_beat(beat));
      }
      if(check(beat, "IsTuplet")) {
        const tupletBeats = beat.split("-");
        tupletBeats.forEach((tupletBeat) => {
          durations.push(get_tone_from_beat(tupletBeat, tupletBeats.length / 2));
        });
      }
      if(check(beat, "IsTie")) {
        const tiedBeats = beat.split("~");
        tiedBeats.forEach((tiedBeat) => {
          durations.push(get_tone_from_beat(tiedBeat));
        });
      }
    }
  });
  return durations.flat();
}
function play_rhythm() {
  /*const sampler = new Tone.Sampler({
    urls: {
      C5: file("hit.wav"),
    },
    release: 1,
  }).toDestination();*/
  const sampler = new Tone.Synth().toDestination();
  const now = Tone.now();
  const beats = strip_beats(currentPattern);
  var ticks = 0;
  console.log(beats);
  beats.forEach((beat, i) => {
    const tone = beats[i];
    for(var i = 0; i < tone.repeat; i++) {
      if(!beat.rest) sampler.triggerAttackRelease("F3", tone.length, now + ticks);
      ticks += tone.duration / tone.repeat;
    }
  });
  Tone.getTransport().start();
}
play_button.addEventListener("click", play_rhythm);
bpm_slider.addEventListener("mousemove", () =>  {
  bpm_display.innerHTML = bpm_slider.value;
});
