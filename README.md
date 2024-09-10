# ECE 461 Project - npm Package Metric Analysis

## Authors:

- Ata Ulas Guler
- Brendan McLaughlin
- James Murrer
- Jackson Fair

## Description

This project is a simple Node.js and TypeScript application that currently runs a "Hello World" message on localhost:3000. The project is structured to follow modern JavaScript and TypeScript development practices, including linting and module management.

## Folder Structure

dist/: This folder contains the compiled JavaScript files. The main files here are:
app.js: The compiled JavaScript file generated from TypeScript.
app.js.map: A source map for debugging purposes.
node_modules/: Contains all dependencies installed through npm, including various Node.js modules required for the project.
src/: This folder contains the TypeScript source file:
app.ts: The TypeScript file that runs the main logic of the application, currently configured to return "Hello World" on the root URL.
eslint.config.mjs: This file contains the ESLint configuration for code linting, ensuring the project adheres to coding standards.
package.json: Manages the project's dependencies, scripts, and metadata.
package-lock.json: Auto-generated file that locks the versions of all installed npm packages.
tsconfig.json: TypeScript configuration file, defining how TypeScript files are compiled.

## Prerequisites

Make sure you have the following installed on your machine:

Node.js (v14.x or later recommended)
npm (v6.x or later)

# Running the Application

npm run start

The application will start on localhost:3000. You should see "Hello World" when you open your browser and navigate to this URL.

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
Code Review Process: Before a pull request is approved, all project members are required to review the code changes. Pull requests will only be merged into the main branch after the entire team has read over and agreed on the changes.

## Testing:

npm test