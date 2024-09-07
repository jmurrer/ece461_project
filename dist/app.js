"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commander_1 = require("commander");
const app = (0, express_1.default)();
const port = 3000;
// Get command line args
const program = new commander_1.Command();
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
//# sourceMappingURL=app.js.map