const readline = require('readline');
const fs = require('fs');
const myConsole = new console.Console(fs.createWriteStream('./02-write-file/output.txt'));

const userMessage = {
  greeting: 'Please enter something',
  exit: 'exit',
  success: 'Done!',
  bye: 'Bye!'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> ',
});

console.log(userMessage.greeting);
rl.prompt();

rl.on('line', (line) => {
  line = line.trim();
  if (line !== userMessage.exit) {
    myConsole.log(line);
    console.log(userMessage.success);
  } else {
    console.log(userMessage.bye);
    process.exit(0);
  }
}).on('close', () => {
  rl.close();
  console.log(userMessage.bye);
  process.exit(0);
});