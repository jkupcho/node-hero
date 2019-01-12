exports.readContext = function(buffer, offset) {
  return {
    byteCounter: offset,
    bytePosition: 0,
    bitsRead: 0,
    byte: buffer.readUInt8(offset),
    buffer
  };
};

exports.walkBits = function(context, numBits) {
  let bit = 0;
  let value = '';

  while (true) {
    bit = context.byte & 1;
    value = bit + value;

    ++context.bitsRead;
    ++context.bytePosition;

    if (context.bytePosition === 8) {
      context.bytePosition = 0;
      ++context.byteCounter;
      context.byte = context.buffer.readUInt8(context.byteCounter);
    }

    // If the byte position wasn't just reset, rotate the byte 1 to the left.
    if (context.bytePosition > 0) {
      context.byte >>= 1;
    }

    if (context.bitsRead === numBits) {
      break;
    }
  }
  context.bitsRead = 0;
  return value;
};

// Takes a bit string, a buffer, and an offset within the buffer and
// walks the bytes in the bitString applying a bitwise OR against
// the buffer to write out the bits byte by byte.
// Expects bitString to be a multiple of 8 in order to work properly.
exports.writeBitsFromString = function(bitString, buffer, offset) {
  if (bitString.length % 8 !== 0) {
    throw Error(
      'bitString must be a multiple of 8, prepend or append 0s, first.'
    );
  }

  let length = bitString.length;
  let walkingOffset = offset;

  while (length > 0) {
    let byte = Number.parseInt(bitString.substring(length - 8, length), '2');

    buffer[walkingOffset] = 0x0;
    buffer[walkingOffset] |= byte;

    length -= 8;
    walkingOffset += 0x1;
  }
};

function padLeft(padStr, length, str) {
  return Array(length - padStr.length + 1).join(str || '0') + padStr;
}

function padRight(padStr, length, str) {
  return padStr + Array(length - padStr.length + 1).join(str || '0');
}

exports.padLeft = padLeft;
exports.padRight = padRight;

exports.appendRight = function(padStr, numAppend, str) {
  return padRight(padStr, padStr.length + numAppend, str || '0');
};

exports.appendLeft = function(padStr, numAppend, str) {
  return padLeft(padStr, padStr.length + numAppend, str || '0');
};
