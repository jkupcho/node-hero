const checksumOffset = 0xc;

exports.checksumOffset = checksumOffset;

exports.writeNewChecksum = function(buffer) {
  let runningChecksum = 0;
  const fileLength = buffer.length;

  // reset checksum to zero
  buffer.writeUInt32LE(0, checksumOffset);
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

  buffer.writeUInt32LE(runningChecksum, checksumOffset);
};

exports.writeHeaderLevel = function (buffer, level) {
  buffer.writeUInt8(level, 43);
}