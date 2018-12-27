const fs = require('fs');

const characterBuffer = fs.readFileSync(
  '/Applications/Diablo II/Save/Blah.d2s'
);
const fileLength = characterBuffer.length;

console.log(`file checksum: ${characterBuffer.readInt32LE(0xc)}`);
console.log(`character level: ${characterBuffer.readInt32LE(0x2b)}`);

characterBuffer.writeIntLE(0, 12, 4);
characterBuffer.writeInt32LE(99, 0x2b);

let runningChecksum = 0;

for (let i = 0; i < fileLength; ++i) {
  runningChecksum =
    (runningChecksum << 1) +
    characterBuffer[i] +
    (runningChecksum & 0x80000000 ? 1 : 0);
}

const strengthAttributeId = reverseBits(
  readBits64(characterBuffer, 0x2ff, 9, false),
  9
);
console.log(strengthAttributeId);
const strengthAttributeValue = reverseBits(
  readBits64(characterBuffer, 0x2ff + 10, 8, false),
  8
);

const attributeId = reverseBits(
  readBits64(characterBuffer, 0x2ff + 11, 9, false),
  9
);
const attributeValue = reverseBits(
  readBits64(characterBuffer, 0x2ff + 10, 18, false),
  18
);

console.log(`Attribute ID: ${attributeId}`);
console.log(`Attribute Value: ${attributeValue / 256}`);

console.log(`Checksum result: ${runningChecksum}`);

console.log(`Attribute ID: ${strengthAttributeId}`);
console.log(`Attribute Value: ${strengthAttributeValue}`);

function readBits64(buffer, bits, reverse) {
  let readBits = 0;
  let result = 0;
  while (bits > readBits) {
    let byte = buffer.readUIntLE(readBits, 1);
    if (reverse) {
      byte = reverseByte(byte);
    }
    result <<= 8;
    result |= byte;
    readBits += 8;
  }
  result = (result >> (readBits - bits)) & ((1 << bits) - 1);
  return result;
}

function reverseByte(byte) {
  let d = 0;
  for (let i = 0; i < 8; i++) {
    d <<= 1;
    d |= byte & 1;
    byte >>= 1;
  }
  return d;
}

function reverseBits(byte, numBits) {
  let d = 0;
  for (let i = 0; i < numBits; i++) {
    d <<= 1;
    d |= byte & 1;
    byte >>= 1;
  }
  return d;
}

// console.log(`Strength Value: ${characterBuffer.readIntLE(0x303, 4)}`);

// console.log(`Stat header: ${characterBuffer.toString('ascii', 0x2fd, 0x2ff)}`);

// console.log(`Stat Bitmask: ${statBitmask}`);
// console.log(`Strength Set: ${statBitmask & 0x1}`);
// console.log(`Dexterity Set: ${statBitmask & 0xf}`);
// console.log(`Strength: ${characterBuffer.readInt32LE(0x2ff)}`);

// Write out Checksum and filesize
// characterBuffer.writeInt32LE(runningChecksum, 0xc);
// characterBuffer.writeInt32LE(characterBuffer.byteLength, 0x8);

// fs.writeFileSync('/Applications/Diablo II/Save/Blah.d2s', characterBuffer);

// for (const value of readFile.values()) {
//   runningChecksum = (runningChecksum << 1) + value;
// }
// console.log(`Checksum result: ${runningChecksum}`);
