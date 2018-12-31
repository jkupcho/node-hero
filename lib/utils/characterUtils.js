const checksumOffset = 0xc;

exports.writeNewChecksum = function(buffer) {
  let runningChecksum = 0;
  const fileLength = buffer.length;

  // reset checksum to zero
  buffer.writeInt32LE(0, checksumOffset);
  /**
   * Calculating checksum manually to make sure
   * algorithm works.
   */
  for (let i = 0; i < fileLength; ++i) {
    runningChecksum =
      (runningChecksum << 1) +
      buffer[i] +
      (runningChecksum & 0x80000000 ? 1 : 0);
  }

  buffer.writeInt32LE(runningChecksum, checksumOffset);
};

exports.writeFileSize = function (buffer) {
  buffer.writeInt32LE(buffer.length, 0x8);
}

exports.writeHeaderLevel = function (buffer, level) {
  buffer.writeInt32LE(level, 43);
}