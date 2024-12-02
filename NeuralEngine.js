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
const patterns = [

];


//Compile();
//console.log(net.run("4 "));
