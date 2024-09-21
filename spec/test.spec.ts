const fs = require('fs');
const path = require('path');

describe("Text Files Test Suite", () => {
    const testFilesDir = path.resolve(__dirname, 'testFiles');

    // Read all .txt files from the testFiles directory (excludes responses)
    const files = fs.readdirSync(testFilesDir).filter(file => !/^test\d+response\.txt$/.test(file));
    console.log('\nTest Files:\n', files);

    files.forEach(file => {
        const filePath = path.join(testFilesDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const responseFile = file.replace('.txt', 'response.txt');
        const responseFilePath = path.join(testFilesDir, responseFile);
        const responseContent = fs.readFileSync(responseFilePath, 'utf-8');

        it(`should process the content of ${file}`, async() => {
            expect(fileContent.length).toBeGreaterThan(0);  // Content length > 0

            // Dynamically import the ES module
            const fileUrl = new URL(`file://${path.resolve(__dirname, '../instrumented/app.js')}`);
            const { main } = await import(fileUrl.href);

            // Get response
            const response = await main(path.resolve(testFilesDir, file));
            expect(response).toBeDefined();  // Ensure the content is not empty

            // Check if response if valid JSON and matches response
            const ndjsonOutput = JSON.parse(response);
            expect(response).toEqual(responseContent);
        });
    });
});
