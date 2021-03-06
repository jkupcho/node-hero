const fs = require('fs');
const path = require('path');
const {
  appendLeft,
  padLeft,
  padRight,
  writeBitsFromString
} = require('./utils/bitUtils');
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

const statsBinary = writeStats();

// Stat bytes start at 0x2ff
writeBitsFromString(statsBinary, newCharacter, 0x2ff);

// Item Start Offset: 0x355 End Offset: 0x40b
const beforeItemsBuffer = newCharacter.slice(0, 0x355);
const afterItemsBuffer = newCharacter.slice(0x40b);

// 4 bytes for JM, then 2 for num items.
const itemBufferHeader = Buffer.alloc(2 + 2);

itemBufferHeader.write('JM', 0, 2, 'ascii');
itemBufferHeader.writeInt16LE(1, 2);

let itemBinary = 'JM'.split('').reduce((acc, str) => {
  return padLeft(str.charCodeAt(0).toString(2), 8) + acc;
}, '');

// Unknown 4 bits.
itemBinary = padLeft('', 4) + itemBinary;
// Identified.
itemBinary = '1' + itemBinary;
// Unknown 6 bits.
itemBinary = appendLeft(itemBinary, 6);
// Item Socketed
itemBinary = '0' + itemBinary;
// Unknown
itemBinary = '0' + itemBinary;
// Picked up since last saved.
itemBinary = '0' + itemBinary;
// Unknown
itemBinary = appendLeft(itemBinary, 2);
// Player Ear.
itemBinary = '0' + itemBinary;
// Newbie Item.
itemBinary = '0' + itemBinary;
// Unknown
itemBinary = appendLeft(itemBinary, 3);
// Simple Item.
itemBinary = '0' + itemBinary;
// Ethereal Item.
itemBinary = '0' + itemBinary;
// Unknown.
itemBinary = '1' + itemBinary;
// Personalized.
itemBinary = '0' + itemBinary;
// Unknown.
itemBinary = '0' + itemBinary;
// Rune Word.
itemBinary = '0' + itemBinary;
// Unknown
itemBinary = appendLeft(itemBinary, 15);
// Item Location
// 0 - Stored
// 1 - Equipped
// 2 - In Belt
// 4 - Moved (on mouse)
// 6 - In socket
itemBinary = padLeft((0x0).toString('2'), 3) + itemBinary;
// Where the item is equipped
itemBinary = appendLeft(itemBinary, 4);
// Column Number Starting from left: 0-9 for Inventory
itemBinary = padLeft((0x0).toString('2'), 4) + itemBinary;
// Row Number Starting from left: 0-3 for Inventory
itemBinary = padLeft((0x0).toString('2'), 3) + itemBinary;
// Unknown
itemBinary = appendLeft(itemBinary, 1);
// Item location 1 for inventory 4 for cube 5 for stash
itemBinary = padLeft((0x1).toString(2), 3) + itemBinary;
// Item Name '2hs ', needs the final space.
const itemName = 'axe ';

console.log(`Item Binary Length: ${itemBinary.length}`);
itemBinary =
  itemName.split('').reduce((acc, str) => {
    const newValue = padLeft(str.charCodeAt(0).toString(2), 8) + acc;
    return newValue;
  }, '') + itemBinary;

console.log(`Item Binary Length: ${itemBinary.length}`);

// Number Socketed Items
itemBinary = appendLeft(itemBinary, 3);

// Unique Identifier for item.
itemBinary = appendLeft(itemBinary, 32);

// Item Level
itemBinary = appendLeft(itemBinary, 7);

// Item Quality
itemBinary = padLeft((0x2).toString(2), 4) + itemBinary;

// Ring / Amulet - Multiple Pictures
itemBinary = appendLeft(itemBinary, 1);

// Class Specific Items
itemBinary = appendLeft(itemBinary, 1);

// Unknown Field
itemBinary = appendLeft(itemBinary, 1);

// Armor Defense rating goes here.
// 10 bits.
// Durability Max
itemBinary = padLeft(Number.parseInt('32').toString(2), 8) + itemBinary;

// Durability Current
itemBinary = padLeft(Number.parseInt('32').toString(2), 8) + itemBinary;

// Random Bit after Durability
itemBinary = appendLeft(itemBinary, 1);

// Item Terminator
itemBinary = (0x1ff).toString(2) + itemBinary;

const leftOverBits = itemBinary.length % 8;
itemBinary = padLeft(itemBinary, itemBinary.length + (8 - leftOverBits));

// JM (2) + 2 bytes of zeroes.
const itemsFinished = Buffer.alloc(2 + 2);

// Finished Items delimiter.
itemsFinished.write('JM', 0, 2, 'ascii');

const itemBinaryBuffer = Buffer.alloc(itemBinary.length / 8);

writeBitsFromString(itemBinary, itemBinaryBuffer, 0);

const finishedCharacter = Buffer.concat([
  beforeItemsBuffer,
  itemBufferHeader,
  itemBinaryBuffer,
  itemsFinished,
  afterItemsBuffer
]);

characterUtils.writeHeaderLevel(finishedCharacter, 99);
characterUtils.writeFileSize(finishedCharacter);
characterUtils.writeCharacterName(finishedCharacter, 'NewChar');

characterUtils.writeNewChecksum(finishedCharacter);

fs.writeFileSync('/Applications/Diablo II/Save/NewChar.d2s', finishedCharacter);
