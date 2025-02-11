const config = {
  iterations: 1000,
  logPeriod: 10,
  log: true,
  timeout: 3000,
}
const net = new brain.recurrent.LSTM();
const training = [];
function Seed() {
  return Math.random() * 10000000000000000;
}
function Train(data = simplifiedPattern) {
  //const seed = Seed();
  training.push(data);
}
function Compile() {
  net.train(training, config);
}
const options = [
  {beats: "4", ticks: 4096},
  {beats: "8", ticks: 2048},
  {beats: "8>", ticks: 2048},
  {beats: "8ttt", ticks: 2048},
  {beats: "8-8-8", ticks: 4096},
  {beats: "16", ticks: 1024},
];
const patterns = [
  "4/4 4 4 8 8 4 | 16 16 16 16 8 8 4 4r",
  "4/4 f 8 8 16r 8 16 8 8 p 16 16 16 16 | f 8- 8 -8 8 8 4 4>",
  "2/4 8 8> 8ttt>~ ~8 | 4ttt>~ ~8 16 16",
  "2/4 8tt>~ ~8 8tt>~ ~8 | 16 8dtt~ ~16> 8d",
  "4/4 8 4d 8 4d | 2ttt~ ~8 8 4r",
  "3/4 8>-8-8 8 8 8r 8 | 8>-8-8 8 8 8r 8",
  "3/4 8 8 8>-8-8 8 8 | 8r 8 16 16 16 16 8 8",
  "3/4 16 16 16 16 8 8 8r 8 | 16> 16 16 16 16r 16 16 16 16 16 16 16"
];


//Compile();
//console.log(net.run("4 "));
