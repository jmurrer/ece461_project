import express from 'express';
import * as readline from 'readline';

const app = express();
const port = 3000;

// Initialize CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Read CLI
let userInput: String = '';
rl.on('line', (input: String) => {
  console.log(`Input: ${input}`);
  userInput = input;
});

// Send data to port
// app.get('/', (req, res) => {
//   // res.send('Hello World!');
//   res.send(`Input: ${userInput}`);
// });

// app.listen(port, () => {
//   //return console.log(`Express is listening at http://localhost:${port}`);

// });

// CLose CLI
rl.on('close', () =>{
  console.log('Input stream closed...');
})
