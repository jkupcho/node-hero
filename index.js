const fs = require('fs');

const readStats = require('./lib/readStats').default;

const characterBuffer = fs.readFileSync('./Blah.d2s');
const fileLength = characterBuffer.length;

const fileChecksum = characterBuffer.readInt32LE(0xc);

console.log(`file checksum: ${fileChecksum}`);

characterBuffer.writeIntLE(0, 12, 4);

let runningChecksum = 0;

/**
 * Calculating checksum manually to make sure
 * algorithm works.
 */
for (let i = 0; i < fileLength; ++i) {
  runningChecksum =
    (runningChecksum << 1) +
    characterBuffer[i] +
    (runningChecksum & 0x80000000 ? 1 : 0);
}

/**
 * Verify checksums match.
 */
console.log(`checksums match: ${fileChecksum === runningChecksum}`);

readStats();
