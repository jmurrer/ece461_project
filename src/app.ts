import * as ms from './metric_score.js';

async function main() {
    try {
        const score = await ms.netScore("https://www.npmjs.com/package/safe-regex-test");
        console.log(score);
    } catch (err) {
        console.log(err);
    } finally {
        process.exit(0);
    }
}

main();
