// src/utils/bleParser.js
import {
  updateEdaData
} from '@/api/algorithm.js';
import {
  getCurrentTimeFormatted,
  GUID
} from '@/utils/comm.js';
let buffer = [];
let onDataCallback = null;
// 在外部维护数据缓冲区
const PPG_BUFFER = {
  red: [],
  infrared: [],
  maxLength: 125 // 1秒数据（125Hz采样率）
};

export function setOnDataParsed(callback, index) {
  onDataCallback = null
  if (index == 1) {
    onDataCallback = callback;
  } else {
    onDataCallback = callback;
  }

}
let gsrUpload = [];
let guid = '';
let shangchuan = false;
export function kaishipidianshangchuan(zhi = false) {
  shangchuan = zhi
  zhi ? guid = GUID() : guid = ''
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
            if (shangchuan) {
              gsrUpload.push(...gsrData.gsr);
              if (gsrUpload.length % 100 == 0) {
                uploadGsrData();
              }
            }

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

function uploadGsrData() {
  const dataToUpload = gsrUpload.slice(-100); // 取出最后100条数据
  const obj = {
    pId: guid,
    eda: dataToUpload,
    patientName: uni.getStorageSync('user').name || '测试人员',
    gender: uni.getStorageSync('user').sex || '男',
    age: uni.getStorageSync('user').age || 18,
    patientPhone: uni.getStorageSync('user').tel || uni.getStorageSync('tel'),
    patientCode: '411325200310186547',
    deviceSn: uni.getStorageSync('pidian').name || 'MPPB20000069',
    hospName: uni.getStorageSync('user').hospName || '测试医院',
    samplingRate: 10,
    recordDate: getCurrentTimeFormatted()
  };
  console.log('上传皮电数据', obj);
  console.log('此时长度', gsrUpload.length);
  // 调用上传函数
  updateEdaData(obj)
    .then((res) => {
      console.log('上传皮电数据返回值');
      console.log(res);
      // 成功上传后，删除已上传的数据
      gsrUpload = gsrUpload.slice(100); // 删除前100个已上传的数据
    })
    .catch((err) => {
      console.error('上传失败:', err);
      // 失败时不清空缓存，下次重试
    });
};

function parsePPGData(bufferArray) {
  const view = new DataView(new Uint8Array(bufferArray).buffer);

  // 校验帧头与长度
  if (view.byteLength < 177) throw new Error("数据长度不足177字节");
  if (
    view.getUint8(0) !== 0x00 ||
    view.getUint8(1) !== 0xAA ||
    view.getUint8(2) !== 0x00 ||
    view.getUint8(3) !== 0xCC
  ) {
    throw new Error("帧头校验失败");
  }

  const parsedData = {
    deviceId: [
      view.getUint8(4),
      view.getUint8(5),
      view.getUint8(6),
      view.getUint8(7)
    ].map(b => b.toString(16).padStart(2, "0")).join(""),
    dataType: view.getUint8(8),
    timestamp: view.getUint16(9, false), // 大端序
    red: Array.from({
      length: 4
    }, () => []),
    infrared: Array.from({
      length: 4
    }, () => []),
    acc: {
      x: 0,
      y: 0,
      z: 0
    },
    SpO2: null,
  };

  // 解析红光数据
  for (let channel = 0; channel < 4; channel++) {
    for (let sample = 0; sample < 5; sample++) {
      const offset = 11 + (channel * 5 + sample) * 4;
      const status = view.getUint8(offset);
      const value = ((view.getUint8(offset + 1) << 16) |
        (view.getUint8(offset + 2) << 8) |
        view.getUint8(offset + 3)) >>> 0;
      parsedData.red[channel].push({
        status,
        value
      });
    }
  }

  // 解析红外光数据
  for (let channel = 0; channel < 4; channel++) {
    for (let sample = 0; sample < 5; sample++) {
      const offset = 91 + (channel * 5 + sample) * 4;
      const status = view.getUint8(offset);
      const value = ((view.getUint8(offset + 1) << 16) |
        (view.getUint8(offset + 2) << 8) |
        view.getUint8(offset + 3)) >>> 0;
      parsedData.infrared[channel].push({
        status,
        value
      });
    }
  }

  // 解析加速度数据 ✅ 放在这里
  const accelOffset = 171;
  parsedData.acc.x = view.getInt16(accelOffset, false) * 32 / 32768;
  parsedData.acc.y = view.getInt16(accelOffset + 2, false) * 32 / 32768;
  parsedData.acc.z = view.getInt16(accelOffset + 4, false) * 32 / 32768;

  // 计算运动幅度 如果太大就不计算SpO2
  // const movementMagnitude = Math.sqrt(parsedData.acc.x ** 2 + parsedData.acc.y ** 2 + parsedData.acc.z ** 2);
  // console.log(movementMagnitude);
  // // 阈值判断（假设阈值为 0.5 m/s²）
  // const MAX_MOVEMENT_FOR_SPO2 = 3;
  // if (movementMagnitude > MAX_MOVEMENT_FOR_SPO2) {
  //   console.log("运动幅度过大，跳过 SpO2 计算");
  // } else {
  //   console.log("运动幅度正常，继续计算 SpO2");
  // }

  // const redSamples = extractValidSamples(parsedData.red);
  // const irSamples = extractValidSamples(parsedData.infrared);
  // const filteredRed = movingAverage(redSamples);
  // const filteredIR = movingAverage(irSamples);
  // const {
  //   ac: acRed,
  //   dc: dcRed
  // } = calculateACDC(filteredRed);
  // const {
  //   ac: acIR,
  //   dc: dcIR
  // } = calculateACDC(filteredIR);

  // // 计算AC/DC比值（取峰峰值）
  // const ratioRed = (Math.max(...acRed) - Math.min(...acRed)) / dcRed[0];
  // const ratioIR = (Math.max(...acIR) - Math.min(...acIR)) / dcIR[0];

  // // 示例校准参数（需根据设备特性调整！）
  // const CALIB_A = 110;
  // const CALIB_B = 25;

  // function calculateSpO2(ratioRed, ratioIR) {
  //   const R = ratioRed / ratioIR;
  //   return CALIB_A - CALIB_B * R; // 简化线性模型
  // }
  // const spo2 = calculateSpO2(ratioRed, ratioIR);
  // console.log('血氧', spo2);

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
// 提取所有有效采样点（假设 status=0 为有效数据）
function extractValidSamples(ppgArray) {
  return ppgArray.flatMap(channel =>
    channel.filter(sample => sample.status === 0)
    .map(sample => sample.value)
  );
}
// 移动平均滤波（简化版）
function movingAverage(data, windowSize = 5) {
  return data.map((_, i) => {
    const start = Math.max(0, i - windowSize);
    const subset = data.slice(start, i + 1);
    return subset.reduce((a, b) => a + b, 0) / subset.length;
  });
}
// 分离AC和DC分量
function calculateACDC(signal) {
  const dc = movingAverage(signal, 25); // 用较长窗口计算DC（模拟低通滤波）
  const ac = signal.map((val, i) => val - dc[i]);
  return {
    ac,
    dc
  };
}