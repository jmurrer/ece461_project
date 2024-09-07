"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const readline = __importStar(require("readline"));
const app = (0, express_1.default)();
const port = 3000;
// Initialize CLI
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
// Read CLI
let userInput = '';
rl.on('line', (input) => {
    console.log(`Input: ${input}`);
    userInput = input;
});
app.get('/', (req, res) => {
    res.send(`Input: ${userInput}`);
});
app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});
// CLose CLI
rl.on('close', () => {
    console.log('Input stream closed...');
});
//# sourceMappingURL=app.js.map