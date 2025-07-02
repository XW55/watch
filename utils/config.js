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
// PPG 数据缓冲区
const PPG_BUFFER = {
  red: [
    [],
    [],
    [],
    []
  ], // 四个红光通道
  infrared: [
    [],
    [],
    [],
    []
  ], // 四个红外光通道
  acc: {
    x: [],
    y: [],
    z: []
  }
};

// GSR 数据缓冲区
let GSR_BUFFER = [];

const PPG_SAMPLE_RATE = 125; // PPG采样率
const GSR_SAMPLE_RATE = 10; // GSR采样率

const PPG_UPLOAD_THRESHOLD = PPG_SAMPLE_RATE * 10; // 1250条
const GSR_UPLOAD_THRESHOLD = GSR_SAMPLE_RATE * 10; // 100条

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
            if (shangchuan) {
              // ✅ 把解析后的数据写入缓冲区
              for (let ch = 0; ch < 4; ch++) {
                ppgData.red[ch].forEach(item => {
                  PPG_BUFFER.red[ch].push(item.value);
                });
                ppgData.infrared[ch].forEach(item => {
                  PPG_BUFFER.infrared[ch].push(item.value);
                });
              }
              PPG_BUFFER.acc.x.push(ppgData.acc.x);
              PPG_BUFFER.acc.y.push(ppgData.acc.y);
              PPG_BUFFER.acc.z.push(ppgData.acc.z);
              checkAndUpload(); // 检查是否满足上传条件
            }
            buffer = buffer.slice(i + 177);
            foundHeader = true;
            break;
          } else if (dataType === 0x21 && buffer.length - i >= 29) {
            const gsrData = parseGSRData(buffer.slice(i, i + 29));
            if (onDataCallback) onDataCallback('gsr', gsrData);

            if (shangchuan) {
              GSR_BUFFER.push(...gsrData.gsr); // 推入缓冲区
              checkAndUpload(); // 检查是否满足上传条件
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

function checkAndUpload() {
  const isPPGReady =
    PPG_BUFFER.red.every(channel => channel.length === 0 || channel.length >= PPG_UPLOAD_THRESHOLD) &&
    PPG_BUFFER.infrared.every(channel => channel.length === 0 || channel.length >= PPG_UPLOAD_THRESHOLD);

  const isGSRReady = GSR_BUFFER.length >= GSR_UPLOAD_THRESHOLD;

  if (isPPGReady && isGSRReady) {
    uploadUnifiedData();
  }
}

function uploadUnifiedData() {
  const obj = {
    pId: guid,
    patientName: uni.getStorageSync('user')?.name || '测试人员',
    gender: uni.getStorageSync('user')?.sex || '男',
    age: uni.getStorageSync('user')?.age || 18,
    patientPhone: uni.getStorageSync('user')?.tel || uni.getStorageSync('tel'),
    patientCode: uni.getStorageSync('tel'),
    deviceSn: uni.getStorageSync('pidian')?.name || 'MPPB20000069',
    hospName: uni.getStorageSync('user')?.hospName || '测试医院',
    // samplingRate: {
    //   ppg: PPG_SAMPLE_RATE,
    //   eda: GSR_SAMPLE_RATE
    // },
    samplingRate: 10,
    recordDate: getCurrentTimeFormatted(),

    acc: {
      x: PPG_BUFFER.acc.x.slice(0, PPG_UPLOAD_THRESHOLD),
      y: PPG_BUFFER.acc.y.slice(0, PPG_UPLOAD_THRESHOLD),
      z: PPG_BUFFER.acc.z.slice(0, PPG_UPLOAD_THRESHOLD)
    },
    red: {
      "0": PPG_BUFFER.red[0].slice(0, PPG_UPLOAD_THRESHOLD),
      "1": PPG_BUFFER.red[1].slice(0, PPG_UPLOAD_THRESHOLD),
      "2": PPG_BUFFER.red[2].slice(0, PPG_UPLOAD_THRESHOLD),
      "3": PPG_BUFFER.red[3].slice(0, PPG_UPLOAD_THRESHOLD)
    },
    infrared: {
      "0": PPG_BUFFER.infrared[0].slice(0, PPG_UPLOAD_THRESHOLD),
      "1": PPG_BUFFER.infrared[1].slice(0, PPG_UPLOAD_THRESHOLD),
      "2": PPG_BUFFER.infrared[2].slice(0, PPG_UPLOAD_THRESHOLD),
      "3": PPG_BUFFER.infrared[3].slice(0, PPG_UPLOAD_THRESHOLD)
    },

    // 只上传前 100 条 GSR 数据
    eda: GSR_BUFFER.slice(0, GSR_UPLOAD_THRESHOLD)
  };

  console.log('准备统一上传PPG+GSR数据:', obj);

  updateEdaData(obj)
    .then(res => {
      console.log('统一上传成功', res);
      clearBuffers(); // 清空已上传的数据
    })
    .catch(err => {
      console.error('统一上传失败:', err);
    });
}

function clearBuffers() {
  // 清空 PPG 缓冲区中已上传的部分
  for (let i = 0; i < 4; i++) {
    PPG_BUFFER.red[i] = PPG_BUFFER.red[i].slice(PPG_UPLOAD_THRESHOLD);
    PPG_BUFFER.infrared[i] = PPG_BUFFER.infrared[i].slice(PPG_UPLOAD_THRESHOLD);
  }

  PPG_BUFFER.acc.x = PPG_BUFFER.acc.x.slice(PPG_UPLOAD_THRESHOLD);
  PPG_BUFFER.acc.y = PPG_BUFFER.acc.y.slice(PPG_UPLOAD_THRESHOLD);
  PPG_BUFFER.acc.z = PPG_BUFFER.acc.z.slice(PPG_UPLOAD_THRESHOLD);

  // 清空 GSR 缓冲区中已上传的部分
  GSR_BUFFER = GSR_BUFFER.slice(GSR_UPLOAD_THRESHOLD);
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
    samples: [], // 改为按采样点存储
    acc: {
      x: 0,
      y: 0,
      z: 0
    }
  };

  // 解析5个采样点 (每个采样点32字节)
  for (let sampleIndex = 0; sampleIndex < 5; sampleIndex++) {
    const sampleOffset = 11 + sampleIndex * 32;

    const sample = {
      red: new Array(4),
      infrared: new Array(4)
    };

    // 解析红光通道 (前16字节)
    for (let channel = 0; channel < 4; channel++) {
      const offset = sampleOffset + channel * 4;
      const status = view.getUint8(offset);
      const value = (view.getUint8(offset + 1) << 16) |
        (view.getUint8(offset + 2) << 8) |
        view.getUint8(offset + 3);

      sample.red[channel] = {
        status,
        value
      };
    }

    // 解析红外通道 (后16字节)
    for (let channel = 0; channel < 4; channel++) {
      const offset = sampleOffset + 16 + channel * 4;
      const status = view.getUint8(offset);
      const value = (view.getUint8(offset + 1) << 16) |
        (view.getUint8(offset + 2) << 8) |
        view.getUint8(offset + 3);

      sample.infrared[channel] = {
        status,
        value
      };
    }

    parsedData.samples.push(sample);
  }

  // 解析加速度数据 (171-176字节)
  const accelOffset = 171;

  // 使用协议指定的公式: data * 32 / 65535.0
  parsedData.acc.x = (view.getInt16(accelOffset, false) * 32) / 65535.0;
  parsedData.acc.y = (view.getInt16(accelOffset + 2, false) * 32) / 65535.0;
  parsedData.acc.z = (view.getInt16(accelOffset + 4, false) * 32) / 65535.0;

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