const fs = require("fs");
const path = require('path');
const bitUtils = require('./utils/bitUtils');

const statsContext = require("./statsContext.json");
const buffer = fs.readFileSync(path.resolve(__dirname, '../Blah.d2s'));

/***
 * This function will walk the passed numBits given the passed readContext.
 *
 * Stats are read in by first an ID, then the Value for the given ID based on
 * the bitLength for that given stat.
 *
 * IDs are always 9 bits long, Values are of variable length. For example,
 * Strength => ID Value: 0, and Value Bit Length: 10.
 *
 * So, given the following bytes, reading right-to-left (least significant bit to greatest):
 *
 * Byte 0    Byte 1    Byte 2
 * 0000 0000 0001 0100 XXXX X000
 * ____ ___^         * - ID (9 Bits)
 *           ___  __^        *__ - Value (10 Bits)
 *
 * ^ - Represents where reading starts for the current part (ID or Value)
 * * - Represents where reading stops.
 * X - Represents unread bits by this stat.
 *
 * 19 Total Bits Read.
 *
 * ID: 0 0000 0000 => 0
 * Value: 000 0000 1010 => 10
 *
 * The algorithm reads in the bits to a string, masking out the least significant bit
 * then prepends to a value string.
 *
 * Once numBits is reached, the value string is returned.
 */
exports.default = function readStats() {
  const readContext = bitUtils.readContext(buffer, 0x2ff);

  while (true) {
    let value = bitUtils.walkBits(readContext, 9);

    // Convert the binary representation string to an int.
    let id = Number.parseInt(value, 2);

    // When 0x1ff is read, the stats are done.  Not all stats
    // are always written out.
    if (id === 0x1ff) {
      console.log("last stat read, breaking.");
      break;
    }

    // Coerce a string from the id number, then use that
    // as the key from the json file.
    key = "" + id;
    numBits = statsContext[key].numBits;
    stat = statsContext[key].stat;

    value = bitUtils.walkBits(readContext, numBits);

    // Convert the binary representation string to an int.
    let convertedValue = Number.parseInt(value, 2);

    // These IDs need to be divided by 256 for...reasons(?)
    let actualValue =
      id >= 6 && id <= 11 ? convertedValue / 256 : convertedValue;

    console.log(`${stat}: ${actualValue}`);
  }
};
