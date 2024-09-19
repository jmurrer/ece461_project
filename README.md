# ECE 461 Project - npm Package Metric Analysis

## Authors:

- Ata Ulas Guler
- Brendan McLaughlin
- James Murrer
- Jackson Fair

## Description

This project is a Node.js and TypeScript application that evaluates npm and GitHub repositories based on several metrics: bus factor, correctness, ramp-up time, responsiveness, and license status (whether the project has a license or not). The project follows modern JavaScript and TypeScript development practices, including linting, testing, and module management.

## Folder Structure

dist/: Contains the compiled JavaScript files.

app.js: The main compiled JavaScript file generated from TypeScript.

app.js.map: A source map for debugging purposes.

node_modules/: Contains all dependencies installed through npm.

src/: Contains the TypeScript source files:

app.ts: The TypeScript file that runs the main logic of the application.

metric_score.ts: Generates a score for repositories based on key metrics.

scripts/install.sh: Script for installing RPM and Node.js.

Command to install Node.js: install_node
Command to install npm: install_npm

test.txt: Contains test repositories for evaluation.

.gitignore: Specifies files and directories to ignore in version control.

eslint.config.mjs: ESLint configuration for code linting to ensure coding standards are met.

package.json: Manages the project's dependencies, scripts, and metadata.

package-lock.json: Auto-generated file that locks the versions of installed npm packages.

tsconfig.json: TypeScript configuration file that defines how TypeScript files are compiled.

run: A script to install, test, or run the application.

## Prerequisites

Make sure you have the following installed on your machine:

Node.js (v14.x or later recommended)
npm (v6.x or later)

# Running the Application

To install the project dependencies and Node.js packages, run:

./run install

To test the application with a default file (test.txt):

./run test

To run the application with a specific file containing a list of repositories:

./run <file_name>

## Development

The source code is located in the src/app.ts file. If you make any changes to the TypeScript files, ensure you compile them into JavaScript using the TypeScript compiler:
npm run build

You can also run the application in development mode using:
npm run dev

## Linting:

The project uses ESLint for code linting. To run the linter and ensure your code follows best practices:
npm run lint

## Contribution Guidelines:

Clone the repository to your local machine:
git clone https://github.com/yourusername/yourprojectname.git
cd yourprojectname

Create a new branch for your changes:
git checkout -b your-branch-name

Stage the changes you made:
git add .

Make your changes and commit them with a descriptive commit message:
git commit -m "Description of changes"

Push the changes to your fork on GitHub:
git push origin your-branch-name

Open a Pull Request on the main repository and describe the changes you've made.

## Also: Rebasing

may make it easier than cloning an entire repository if the only important changes to the repository made by other contributors are in main. To rebase, follow these steps:check that everything is properly committed to your branch: git status
switch to the branch you want to rebase: git checkout (name of the branch)
rebase the branch onto the target branch (generally main): git rebase (main)
if there are files to add: git add (file)
then continue the process: git rebase --continue
or: git rebase --abort

Code Review Process: Before a pull request is approved, all project members are required to review the code changes. Pull requests will only be merged into the main branch after the entire team has read over and agreed on the changes.