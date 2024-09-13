import express from 'express';
import * as readline from 'readline';
import * as ms from './metric_score';

// use add()  from metric_score.ts
console.log(ms.netScore("https://www.google.com"));

// exit success
process.exit(0);

// web deployment stuff (commenting out for now)
// const app = express();
// const port = 3000;

// CLI Stuff (commenting out for now)
// // Initialize CLI
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// // Read CLI
// let userInput: String = '';
// rl.on('line', (input: String) => {
//   console.log(`Input: ${input}`);
//   userInput = input;
// });

// // CLose CLI
// rl.on('close', () =>{
//   console.log('Input stream closed...');
// });