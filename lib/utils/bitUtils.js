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
  let value = "";

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
