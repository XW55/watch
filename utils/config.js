// src/utils/bleParser.js

let buffer = [];
let onDataCallback = null;

export function setOnDataParsed(callback) {
  onDataCallback = callback;
}

export function processIncomingData(data) {
  const uint8Array = new Uint8Array(data);
  buffer.push(...uint8Array);

  const frameHeader = [0x00, 0xAA, 0x00, 0xCC];
  while (buffer.length >= 29) {
    let foundHeader = false;
    for (let i = 0; i <= buffer.length - 29; i++) {
      if (
        buffer.slice(i, i + 4).every((val, idx) => val === frameHeader[idx])
      ) {
        try {
          const dataType = buffer[i + 8];

          if (dataType === 0x31 && buffer.length - i >= 177) {
            const ppgData = parsePPGData(buffer.slice(i, i + 177));
            if (onDataCallback) onDataCallback('ppg', ppgData);
            buffer = buffer.slice(i + 177);
            foundHeader = true;
            break;
          } else if (dataType === 0x21 && buffer.length - i >= 29) {
            const gsrData = parseGSRData(buffer.slice(i, i + 29));
            if (onDataCallback) onDataCallback('gsr', gsrData);
            buffer = buffer.slice(i + 29);
            foundHeader = true;
            break;
          } else {
            buffer = buffer.slice(i + 1);
            break;
          }
        } catch (e) {
          buffer = buffer.slice(i + 1);
        }
      }
    }
    if (!foundHeader) break;
  }
}

function parsePPGData(bufferArray) {
  const view = new DataView(new Uint8Array(bufferArray).buffer);

  // 基础校验
  if (view.byteLength < 177) throw new Error("数据长度不足177字节");
  if (view.getUint8(0) !== 0x00 || view.getUint8(1) !== 0xAA ||
    view.getUint8(2) !== 0x00 || view.getUint8(3) !== 0xCC) {
    throw new Error("帧头校验失败");
  }

  const parsedData = {
    deviceId: [
      view.getUint8(4).toString(16).padStart(2, '0'),
      view.getUint8(5).toString(16).padStart(2, '0'),
      view.getUint8(6).toString(16).padStart(2, '0'),
      view.getUint8(7).toString(16).padStart(2, '0')
    ].join(''),
    dataType: view.getUint8(8),
    timestamp: view.getUint16(9, false), // 大端序
    red: [
      [],
      [],
      [],
      []
    ], // 4通道红光，每通道5个采样点
    infrared: [
      [],
      [],
      [],
      []
    ], // 4通道红外光
    acc: {
      x: 0,
      y: 0,
      z: 0
    }
  };

  // --------------- 解析PPG数据 ---------------
  // 红光数据：从偏移11开始，共80字节（4通道×5采样点×4字节）
  for (let channel = 0; channel < 4; channel++) {
    for (let sample = 0; sample < 5; sample++) {
      const offset = 11 + (channel * 5 + sample) * 4;
      const status = view.getUint8(offset);
      const value = (view.getUint8(offset + 1) << 16) |
        (view.getUint8(offset + 2) << 8) |
        view.getUint8(offset + 3);
      parsedData.red[channel].push({
        status,
        value
      });
    }
  }

  // 红外光数据：从偏移91开始（11+80），共80字节
  for (let channel = 0; channel < 4; channel++) {
    for (let sample = 0; sample < 5; sample++) {
      const offset = 91 + (channel * 5 + sample) * 4;
      const status = view.getUint8(offset);
      const value = (view.getUint8(offset + 1) << 16) |
        (view.getUint8(offset + 2) << 8) |
        view.getUint8(offset + 3);
      parsedData.infrared[channel].push({
        status,
        value
      });
    }
  }

  // --------------- 解析加速度数据 ---------------
  const accelOffset = 171; // 177-6=171
  parsedData.acc.x = view.getInt16(accelOffset, false) * 32 / 32768; // x轴
  parsedData.acc.y = view.getInt16(accelOffset + 2, false) * 32 / 32768; // y轴
  parsedData.acc.z = view.getInt16(accelOffset + 4, false) * 32 / 32768; // z轴

  return parsedData;
}

function parseGSRData(bufferArray) {
  const view = new DataView(new Uint8Array(bufferArray).buffer);
  const parsedData = {
    timestamp: view.getUint16(8),
    gsr: []
  };
  for (let i = 0; i < 10; i++) {
    const n = view.getUint16(9 + i * 2);
    if (n === 0) {
      parsedData.gsr.push(0);
    } else {
      parsedData.gsr.push(
        ((2048 - (n * 2048.0) / 32768) /
          ((n * 2048.0) / 32768 * 499)) *
        1000
      );
    }
  }
  return parsedData;
}