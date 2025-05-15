let buffer = [];
let onDataParsedCallback;

function setOnDataParsed(callback) {
  onDataParsedCallback = callback;
}
// 将ArrayBuffer转换为Uint8Array并添加到全局缓冲区
function appendToBuffer(data) {
  buffer.push(...new Uint8Array(data));
}

// 解析单个PPG数据包
function parsePPGData(bufferArray) {
  const bufferView = new DataView(new Uint8Array(bufferArray).buffer);
  if (bufferView.byteLength < 177) {
    throw new Error("Buffer length is less than 177 bytes for PPG");
  }
  const parsedData = {
    timestamp: bufferView.getUint16(10),
    red: [],
    ir: [],
    acc: {}
  };

  for (let i = 0; i < 4; i++) {
    // 解析红光数据
    let offset = 12 + i * 20;
    parsedData.red.push({
      status: bufferView.getUint8(offset),
      value: bufferView.getUint32(offset + 1) & 0x00FFFFFF
    });

    // 解析红外光数据
    offset += 80 / 4; // 跳到红外光部分
    parsedData.ir.push({
      status: bufferView.getUint8(offset),
      value: bufferView.getUint32(offset + 1) & 0x00FFFFFF
    });
  }

  // 解析三轴加速度数据
  parsedData.acc.x = (bufferView.getInt16(169) * 32 / 65535.0);
  parsedData.acc.y = (bufferView.getInt16(171) * 32 / 65535.0);
  parsedData.acc.z = (bufferView.getInt16(173) * 32 / 65535.0);

  return parsedData;
}

// 解析单个GSR数据包
function parseGSRData(bufferArray) {
  const bufferView = new DataView(new Uint8Array(bufferArray).buffer);
  if (bufferView.byteLength < 29) {
    throw new Error("Buffer length is less than 29 bytes for GSR");
  }
  const parsedData = {
    timestamp: bufferView.getUint16(8),
    gsr: []
  };

  for (let i = 0; i < 10; i++) {
    let n = bufferView.getUint16(9 + i * 2);
    if (n === 0) {
      parsedData.gsr.push(0);
    } else {
      parsedData.gsr.push((2048 - n * 2048.0 / 32768) / (n * 2048.0 / 32768 * 499) * 1000);
    }
  }

  return parsedData;
}

// 处理接收到的数据
function processIncomingData(data) {
  appendToBuffer(data);

  const frameHeader = [0x00, 0xAA, 0x00, 0xCC];
  while (buffer.length >= 29) { // 最小长度应基于最短的数据包
    let foundHeader = false;
    for (let i = 0; i <= buffer.length - 29; i++) {
      if (buffer.slice(i, i + 4).every((val, idx) => val === frameHeader[idx])) {
        try {
          const dataType = buffer[i + 8]; // 获取数据类型字节
          if (dataType === 0x31 && buffer.length - i >= 177) { // PPG数据
            const parsedData = parsePPGData(buffer.slice(i, i + 177));
            if (onDataParsedCallback) onDataParsedCallback('ppg', parsedData);
            buffer = buffer.slice(i + 177);
            foundHeader = true;
            break;
          } else if (dataType === 0x21 && buffer.length - i >= 29) { // GSR数据
            const parsedData = parseGSRData(buffer.slice(i, i + 29));
            if (onDataParsedCallback) onDataParsedCallback('gsr', parsedData);
            buffer = buffer.slice(i + 29);
            foundHeader = true;
            break;
          } else {
            console.error(`Unknown data type: ${dataType} or insufficient data.`);
            buffer = buffer.slice(i + 1);
            break;
          }
        } catch (error) {
          console.error('Error parsing data:', error.message);
          buffer = buffer.slice(i + 1);
          break;
        }
      }
    }
    if (!foundHeader) {
      break;
    }
  }
}

export {
  processIncomingData,
  setOnDataParsed
};