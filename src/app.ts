import express from 'express';
import { Command } from 'commander';

const app = express();
const port = 3000;

// Get command line args
const program = new Command();
program.option('-n, --name <type>', 'name');
program.parse(process.argv);
const options = program.opts();

app.get('/', (req, res) => {
  res.send(`Hello World! Name: ${options.name}`);
});

app.listen(port, () => {
  console.log(`Name: ${options.name}`);
  return console.log(`Express is listening at http://localhost:${port}`);
});

