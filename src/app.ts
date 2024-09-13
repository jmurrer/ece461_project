// import express from 'express';       //commented for linter fixing
import * as readline from 'readline';

// const app = express();        //commented for linter fixing 
// const port = 3000;            //commented for linter fixing

// Initialize CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Read CLI
// let userInput: string = '';        //commented for linter fixing
rl.on('line', (input: string) => {
  console.log(`Input: ${input}`);
// userInput = input;               //commented for linter fixing
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
