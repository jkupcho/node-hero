const fs = require('fs');
const path = require('path');
const bitUtils = require('./utils/bitUtils');
const characterUtils = require('./utils/characterUtils');

const statsContext = require('./statsContext.json');
const buffer = fs.readFileSync(path.resolve(__dirname, '../Blah.d2s'));

const newCharacter = Buffer.alloc(buffer.length);
buffer.copy(newCharacter);

// Level 99 Experience - 3,520,485,254
// Strength: 10
// Energy: 35
// Dexterity: 25
// Vitality: 10
function writeStats() {
  let bitString = '';

  // Strength
  let newStatId = statId(0x0);
  let newStatValue = padLeft(Number.parseInt('10').toString(2), 10);
  bitString = newStatValue + newStatId + bitString;

  // Energy
  newStatId = statId(0x1);
  newStatValue = padLeft(Number.parseInt('35').toString(2), 10);
  bitString = newStatValue + newStatId + bitString;

  // Dexterity
  newStatId = statId(0x2);
  newStatValue = padLeft(Number.parseInt('25').toString(2), 10);
  bitString = newStatValue + newStatId + bitString;

  // Vitality
  newStatId = statId(0x3);
  newStatValue = padLeft(Number.parseInt('10').toString(2), 10);
  bitString = newStatValue + newStatId + bitString;

  // Unused stats
  newStatId = statId(0x4);
  newStatValue = padLeft((5 * 98).toString(2), 10);
  bitString = newStatValue + newStatId + bitString;

  // Unused Skills
  newStatId = statId(0x5);
  newStatValue = padLeft((98).toString(2), 8);
  bitString = newStatValue + newStatId + bitString;

  // Current HP
  newStatId = statId(0x6);
  newStatValue = padLeft(((40 + 98) * 256).toString(2), 21);
  bitString = newStatValue + newStatId + bitString;

  // Max HP
  newStatId = statId(0x7);
  newStatValue = padLeft(((40 + 98) * 256).toString(2), 21);
  bitString = newStatValue + newStatId + bitString;

  // Current Mana
  newStatId = statId(0x8);
  newStatValue = padLeft(((35 + 98 * 2) * 256).toString(2), 21);
  bitString = newStatValue + newStatId + bitString;

  // Max Mana
  newStatId = statId(0x9);
  newStatValue = padLeft(((35 + 98 * 2) * 256).toString(2), 21);
  bitString = newStatValue + newStatId + bitString;

  // Current Stamina
  newStatId = statId(0xa);
  newStatValue = padLeft(((74 + 98) * 256).toString(2), 21);
  bitString = newStatValue + newStatId + bitString;

  // Max Stamina
  newStatId = statId(0xb);
  newStatValue = padLeft(((74 + 98) * 256).toString(2), 21);
  bitString = newStatValue + newStatId + bitString;

  // Level
  newStatId = statId(0xc);
  newStatValue = padLeft(Number.parseInt('99').toString(2), 7);
  bitString = newStatValue + newStatId + bitString;

  // Experience
  newStatId = statId(0xd);
  newStatValue = padLeft(Number.parseInt('3520485254').toString(2), 32);
  bitString = newStatValue + newStatId + bitString;

  // Gold
  newStatId = statId(0xe);
  newStatValue = padLeft(Number.parseInt('10').toString(2), 25);
  bitString = newStatValue + newStatId + bitString;

  // Stashed Gold
  newStatId = statId(0xf);
  newStatValue = padLeft(Number.parseInt('10').toString(2), 25);
  bitString = newStatValue + newStatId + bitString;

  // Append the zero terminator.
  bitString = (0x1ff).toString(2) + bitString;

  // After the stat terminator, pad out the zero bits.
  const leftOverBits = bitString.length % 8;

  console.log(`Before pad leftover bits: ${bitString.length % 8}`);
  bitString = padLeft(bitString, bitString.length + (8 - leftOverBits));
  console.log(`After pad leftover bits: ${bitString.length % 8}`);

  return bitString;
}

function statId(id) {
  return padLeft(id.toString(2), 9);
}

function padLeft(padStr, length, str) {
  return Array(length - padStr.length + 1).join(str || '0') + padStr;
}

function padRight(padStr, length, str) {
  return padStr + Array(length - padStr.length + 1).join(str || '0');
}

const statsBinary = writeStats();
let offset = 0x2ff;
let length = statsBinary.length;

while (length > 0) {
  let statByte = Number.parseInt(
    statsBinary.substring(length - 8, length),
    '2'
  );
  newCharacter[offset] = 0x0;
  newCharacter[offset] |= statByte;

  length -= 8;
  // Move forward 1 byte.
  offset += 0x1;
}

// Item Start Offset: 0x355 End Offset: 0x40b
const beforeItemsBuffer = newCharacter.slice(0, 0x355);
const afterItemsBuffer = newCharacter.slice(0x40b);

// 4 bytes for JM, then 2 for num items.
const itemBufferHeader = Buffer.alloc(2 + 2);

itemBufferHeader.write('JM', 0, 2, 'ascii');
itemBufferHeader.writeInt16LE(0, 2);

// JM (2) + 0x1ff (2).
const itemBufferItems = Buffer.alloc(2 + 2);

// Finished Items delimiter.
itemBufferItems.write('JM', 0, 2, 'ascii');
let delimiter = padRight((0x1ff).toString(2).toString(2), 16);
let itemLength = delimiter.length;
let itemOffset = 3;

while (itemLength > 0) {
  let itemByte = Number.parseInt(delimiter.substring(length - 8, length), '2');
  itemBufferItems[itemOffset] = 0x0;
  itemBufferItems[itemOffset] |= itemByte;

  itemLength -= 8;
  // Move forward 1 byte.
  itemOffset += 0x1;
}

const finishedCharacter = Buffer.concat([
  beforeItemsBuffer,
  itemBufferHeader,
  itemBufferItems,
  afterItemsBuffer
]);

characterUtils.writeHeaderLevel(finishedCharacter, 99);
characterUtils.writeFileSize(finishedCharacter);
characterUtils.writeCharacterName(finishedCharacter, 'NewChar');

characterUtils.writeNewChecksum(finishedCharacter);

fs.writeFileSync('/Applications/Diablo II/Save/NewChar.d2s', finishedCharacter);