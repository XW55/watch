import vueStore from '@/store/index.js';
// 唯里滤波
import filterUtils from '@/pageCheck/components/new12daojisuan.js';
import {
  GUID
} from '@/utils/comm.js';
import {
  processIncomingData,
  ppgValuesHistory,
  gsrValuesHistory
} from '@/utils/config.js'; // 注意路径可能需要调整
import {
  ecgConfig
} from '@/utils/ecgChart.js';
// 回调函数
let bledata = null
export function getdata(deviceId) {
  bledata = deviceId
}

/**
 * 例子
 * @param {string} deviceId - 设备ID
 */
export function lizi(deviceId) {
  return new Promise((resolve, reject) => {
    uni.closeBLEConnection({
      deviceId,
      success: (res) => {
        console.log("蓝牙连接已断开", res);
        resolve(res);
      },
      fail: (err) => {
        console.error("断开连接失败", err);
        reject(err);
      }
    });
  });
}
// 回调函数
let sousuodaodeshebei = null
/**
 * 例子
 * @param {string} deviceId - 设备ID
 */
export function initBlejs(deviceId) {
  sousuodaodeshebei = deviceId
  uni.openBluetoothAdapter({
    success: (res) => {
      uni.getBluetoothAdapterState({
        success: (res1) => {
          startBluetoothDeviceDiscoveryjs();
        },
        fail(error) {
          uni.showToast({
            icon: 'none',
            title: '查看手机蓝牙是否打开'
          });
        }
      });
    },
    fail: (err) => {
      //未打开
      uni.showToast({
        icon: 'none',
        title: '查看手机蓝牙是否打开'
      });
    }
  });
}
let sousuo = false
/**
 * 例子
 * @param {string} deviceId - 设备ID
 */
export function startBluetoothDeviceDiscoveryjs(deviceId) {
  if (sousuo) {
    stopBluetoothDevicesDiscovery(); // 停止搜索蓝牙
  }
  uni.startBluetoothDevicesDiscovery({
    success: (res) => {
      sousuo = true;
      onBluetoothDeviceFound();
    },
    fail: (err) => {
      console.log(err, '错误信息1');
    }
  });
}
let shangchuan = false;
export function shagnchuanshuju(zhi = false) {
  shangchuan = zhi
  zhi ? guid = GUID() : guid = ''
}
// 上传数据
function uploadDataL_LTP(data) {
  // console.log('触发上传数据');
  // console.log(data[1].length);
  // console.log(uni.getStorageSync('user'));
  const newDataObj = {
    patientName: uni.getStorageSync('user').name || '测试人员',
    age: uni.getStorageSync('user').age || 18,
    gender: uni.getStorageSync('user').sex == '男' ? true : false,
    data,
    sampleRate: 250,
    id: guid,
    ecgType: 'DECG12ZKY',
    recordDate: new Date(),
    deviceSn: uni.getStorageSync('xindian').name || 'KY_E_B1',
    patient_phone: uni.getStorageSync('user').tel || uni.getStorageSync('tel'),
    hospName: uni.getStorageSync('user').hospName || '测试医院'
  };
  console.log('12导', newDataObj);
  return uni
    .request({
      header: {
        user: 'zzu',
        password: 'zzu123'
      },
      url: 'https://server.mindyard.cn:84/get_json',
      data: newDataObj,
      method: 'POST',
      timeout: 30000
    })
    .then((res) => {
      console.log('上传12导数据返回值');
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
      // uni.showToast({
      //   title: '数据无法上传',
      //   icon: 'none',
      //   duration: 5000
      // });
    });
}

// 停止搜寻蓝牙设备
export function stopBluetoothDevicesDiscovery() {
  uni.stopBluetoothDevicesDiscovery({
    success: (e) => {
      sousuo = false;
    },
    fail: (e) => {
      console.log('停止搜索蓝牙设备失败，错误码：' + e.errCode);
    }
  });
}
/**
 * 修改切换
 */
let qiehuan = true;
export function getqiehuan(zhi = true) {
  qiehuan = zhi
}
let onDataCallback = null;
export function setOnDataParseds(callback) {
  onDataCallback = callback;
}
// 发现外围设备
export function onBluetoothDeviceFound() {
  uni.onBluetoothDeviceFound((res) => {
    sousuodaodeshebei(res)
  });
}


let xindiancishu = 0;

let pidiancishu = 0;
let setzhuye = null;
// 监听蓝牙连接状态变化
uni.onBLEConnectionStateChange(res => {
  if (!res.connected) {
    console.warn("设备断开连接", res.deviceId);
    console.warn('\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\');
    console.warn(res);
    if (uni.getStorageSync('xindian')?.deviceId == res.deviceId && !res.connected) {
      nowLinkLisjs(uni.getStorageSync('xindian'), 1, () => {
        console.log('心电电设备重连1');
      });
    } else if (uni.getStorageSync('pidian')?.deviceId == res.deviceId && !res.connected) {
      nowLinkLisjs(uni.getStorageSync('pidian'), 1, () => {
        console.log('皮电设备重连1');
      });
    }
  }
});
export function setzhuyes(callback, index) {
  // console.log('-----------------------------------------');
  // console.log(index);
  setzhuye = null
  if (index == 1) {
    setzhuye = callback;
  } else if (index == 2) {
    setzhuye = callback;
  }

}
let setfuye = null;
export function setfuyes(callbacks) {
  setfuye = callbacks;
}
let kaishijieshou = false;
export function setkaishijieshou(callback) {
  kaishijieshou = callback;
  // console.log(`开始接收数据了吗${kaishijieshou?'开始了':'没有'}`);
}
let zijie = 1;
let guid = '';

// 直接启用监听功能
export function nowLinkLisjs(items, index, huidiao) {
  console.log('items', items);
  uni.showLoading({
    title: '连接中，请稍等',
    mask: true
  });
  //连接蓝牙
  uni.createBLEConnection({
    deviceId: items.deviceId,
    success(res) {
      console.log('777777');
      stopBluetoothDevicesDiscovery(); // 停止搜索蓝牙
      huidiao()
      setTimeout(() => {
        uni.notifyBLECharacteristicValueChange({
          state: true, // 启用 notify 功能
          deviceId: items.deviceId,
          serviceId: items.name.startsWith('MP') ?
            '6e4000f1-b5a3-f393-e0a9-e50e24dcca9e' : 'DE5BF728-D711-4E47-AF26-65E3012A5DC7',
          characteristicId: items.name.startsWith('MP') ?
            '6e4000f3-b5a3-f393-e0a9-e50e24dcca9e' : 'DE5BF729-D711-4E47-AF26-65E3012A5DC7',
          success: (res) => {
            // console.log('启用监听了', res);

            uni.hideLoading();
            uni.onBLECharacteristicValueChange((res) => {
              // console.log('-------------');
              // console.log(res);
              // console.log(kaishijieshou);
              // if (kaishijieshou) {
              if (res.serviceId == 'DE5BF728-D711-4E47-AF26-65E3012A5DC7') {
                xindiancishu = 0;
                xindiantiejiaxishuju(res.value)
              } else if (res.serviceId == '6E4000F1-B5A3-F393-E0A9-E50E24DCCA9E') {
                pidiancishu = 0;
                processIncomingData(res.value)
              }
              // }
            });
          },
          fail: (res) => {
            console.log('启用 notify 功能失败', res);
            uni.hideLoading();
            uni.showToast({
              title: '连接失败',
              icon: 'none'
            });
          },
          complete: (res) => {
            console.log('complete1');
            console.log(res);
            uni.hideLoading();
          }
        });
      }, 1000 * (index + 1));
    },
    fail(res) {
      console.log(res);
      if (uni.getStorageSync('xindian')?.deviceId == items.deviceId) {
        console.log('心电重连3');
        console.log(xindiancishu);
        if (xindiancishu == 3) {
          vueStore.commit('SET_XINDIANBLE', '');
          uni.hideLoading();
          console.log('蓝牙连接失败', res);
          uni.showToast({
            title: items.name + '连接失败',
            icon: 'none'
          });
          xindiancishu = 0;
        } else {
          xindiancishu++
          nowLinkLisjs(uni.getStorageSync('xindian'), 1, () => {
            console.log('心电电设备重连2');
          });
        }
      } else if (uni.getStorageSync('pidian')?.deviceId == items.deviceId) {
        console.log('皮电重连3');
        console.log(pidiancishu);
        if (pidiancishu == 3) {
          vueStore.commit('SET_PIDIANBLE', '');
          uni.hideLoading();
          console.log('蓝牙连接失败', res);
          uni.showToast({
            title: items.name + '连接失败',
            icon: 'none'
          });
          pidiancishu = 0;
        } else {
          pidiancishu++
          nowLinkLisjs(uni.getStorageSync('pidian'), 1, () => {
            console.log('皮电设备重连2');
          });
        }
      }
    },
    complete: (res) => {
      console.log('complete2');
      console.log(res);
      uni.hideLoading();
    }
  });
}

function formatString(str) {
  let result = [];
  for (let i = 0; i < str.length; i += 2) {
    let pair = str.substring(i, i + 2);
    result.push('0x' + pair);
  }
  return result.join(' ');
}
// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  const hexArr = Array.prototype.map.call(new Uint8Array(buffer), function(bit) {
    return ('00' + bit.toString(16)).slice(-2);
  });
  return hexArr.join('');
}

function xindiantiejiaxishuju(value) {
  const unit8Arr = new Uint8Array(value);
  console.log(unit8Arr);
  console.log(unit8Arr[0x01]);
  if (unit8Arr[0x01] == 0x32) {
    if (unit8Arr[0x06] == 0x02) {
      console.warn('导联脱落');
    }
  } else if (unit8Arr[0x01] == 0x31) {
    // console.log('-------------');
    // console.log(res);
    // console.log(res.value);
    // console.log(ab2hex(res.value));
    let data = formatString(ab2hex(unit8Arr));
    // console.log(data);
    let hexArray = data.split(' ');
    // console.log(hexArray);
    const result = parseEcgData(hexArray);
    // console.log(hexArray.length);
    // 处理解析结果
    if (result.success) {
      console.log(`成功解析${result.pointsCount}个心电数据点`);
      let zhi = []
      result.dataPoints.forEach((point, index) => {
        zhi[index] = point.voltage * 1
      });
      console.log(zhi);
      bledata(1, ['II'], zhi)
      // shuju.push(...zhi)
      // console.log(JSON.stringify(shuju));
      // 在实际应用中，这里可以将数据传递给图表组件进行绘制
      // 例如使用uni-charts绘制心电图波形
    } else {
      console.error("心电数据解析失败:", result.error);
      if (result.details) {
        console.error("详细信息:", result.details);
      }
    }
  } else if (unit8Arr[0x01] == 0x33) {
    let data = formatString(ab2hex(unit8Arr));
    let hexArray = data.split(' ');
    let zhi = []
    hexArray.forEach((point, index) => {
      zhi[index] = point * 1
    });
    const sensorData = parseAccData(zhi)
    xindianaccfun(1, sensorData.acc)
  }
}
/**
 * 解析心电数据数组
 * @param {Array} hexArray 十六进制字符串数组，如 ["0xbc", "0x31", ...]
 * @param {number} gainFactor 增益倍数，默认1000
 * @returns {Object} 解析结果对象
 */
function parseEcgData(hexArray, gainFactor = 1000) {
  // 1. 转换十六进制字符串为字节数组
  const byteArray = hexArray.map(item => {
    const hex = item.replace(/^0x/i, ''); // 移除0x前缀
    return parseInt(hex, 16);
  });

  // 2. 基础格式验证
  if (byteArray.length < 6) {
    return {
      success: false,
      error: '数据长度不足，无法解析'
    };
  }

  // 验证魔数和指令类型
  if (byteArray[0] !== 0xBC || byteArray[1] !== 0x31) {
    return {
      success: false,
      error: '无效的指令格式，非ECG_DATA数据',
      details: {
        magicByte: byteArray[0],
        command: byteArray[1]
      }
    };
  }

  // 3. 解析数据长度（小端模式）
  const dataLength = byteArray[2] + (byteArray[3] << 8);

  // 4. 解析校验和（小端模式）
  const receivedChecksum = byteArray[4] + (byteArray[5] << 8);

  // 5. 计算数据区校验和
  let calculatedChecksum = 0;
  for (let i = 6; i < byteArray.length; i++) {
    calculatedChecksum += byteArray[i];
  }

  // 6. 校验和验证
  if (calculatedChecksum !== receivedChecksum) {
    return {
      success: false,
      error: '数据校验和错误',
      details: {
        received: receivedChecksum,
        calculated: calculatedChecksum
      }
    };
  }

  // 7. 数据长度验证
  if (byteArray.length - 6 !== dataLength) {
    return {
      success: false,
      error: '数据长度不匹配',
      details: {
        expected: dataLength,
        actual: byteArray.length - 6
      }
    };
  }

  // 8. 解析心电数据点
  const dataPoints = [];
  for (let i = 8; i < byteArray.length; i += 2) {
    if (i + 1 >= byteArray.length) break; // 防止越界

    // 读取两个字节（小端模式）
    const lowByte = byteArray[i];
    const highByte = byteArray[i + 1];

    // 组合为16位原始值
    const rawValue = lowByte + (highByte << 8);

    // 转换为有符号整数
    const signedValue = rawValue > 32767 ? rawValue - 65536 : rawValue;

    // 转换为电压值(mV)
    const voltage = (signedValue / gainFactor).toFixed(3);

    dataPoints.push({
      raw: rawValue,
      signed: signedValue,
      voltage: voltage
    });
  }

  // 9. 返回解析结果
  return {
    success: true,
    command: 'ECG_DATA (0x31)',
    dataLength: dataLength,
    checksum: receivedChecksum,
    pointsCount: dataPoints.length,
    dataPoints: dataPoints
  };
}

function parseSensorData(byteArray) {
  console.log('parseSensorData');
  console.log(byteArray);
  console.log(byteArray.length);
  const accXArray = [];
  const accYArray = [];
  const accZArray = [];
  const gyroXArray = [];
  const gyroYArray = [];
  const gyroZArray = [];

  // Assuming Data class functionality is replaced with direct byte array processing
  for (let i = 0; i < byteArray.length; i += 12) {
    // Extract 16-bit signed values (big-endian)
    const getInt16BE = (offset) => {
      const value = (byteArray[i + offset] << 8) | byteArray[i + offset + 1];
      return value > 32767 ? value - 65536 : value; // Convert to signed
    };

    const accX = getInt16BE(0);
    const accY = getInt16BE(2);
    const accZ = getInt16BE(4);
    const gyroX = getInt16BE(6);
    const gyroY = getInt16BE(8);
    const gyroZ = getInt16BE(10);

    // Convert to physical values
    const accXg = accX * 16 / 32768;
    const accYg = accY * 16 / 32768;
    const accZg = accZ * 16 / 32768;

    const gyroXdps = gyroX * 2000 / 32768;
    const gyroYdps = gyroY * 2000 / 32768;
    const gyroZdps = gyroZ * 2000 / 32768;

    accXArray.push(accXg);
    accYArray.push(accYg);
    accZArray.push(accZg);

    gyroXArray.push(gyroXdps);
    gyroYArray.push(gyroYdps);
    gyroZArray.push(gyroZdps);
  }

  return {
    acc: {
      x: accXArray,
      y: accYArray,
      z: accZArray
    },
    gyro: {
      x: gyroXArray,
      y: gyroYArray,
      z: gyroZArray
    }
  };
}
/**
 * 解析加速度数据（从索引8开始读取，按轴分离数据）
 * @param {Uint8Array} data - 原始数据缓冲区
 * @returns {Object} 包含加速度数据（分轴、分单位）的对象
 */
function parseAccData(data) {
  // console.log(data.length);
  let datazhi = data.slice(-120)
  // console.log(datazhi.length);
  const result = {
    acc: {
      x: [], // 无单位原始值（x轴）
      y: [], // 无单位原始值（y轴）
      z: [], // 无单位原始值（z轴）
      x_g: [], // 有单位值（g，x轴）
      y_g: [], // 有单位值（g，y轴）
      z_g: [] // 有单位值（g，z轴）
    },
    // gyro: {
    //   x: [],
    //   y: [],
    //   z: [], // 文档未提及陀螺仪，留空
    //   x_unit: [],
    //   y_unit: [],
    //   z_unit: []
    // }
  };
  console.log('-----------------------');
  // console.log(datazhi[0]);
  // console.log(datazhi[1]);
  // 从索引8开始解析（跳过前8字节非加速度数据）
  // for (let i = 0; i <= datazhi.length - 6; i += 6) {
  //   // 解析x轴：先组合为16位无符号数，再转换为有符号数
  //   const xRaw16 = ((datazhi[i] << 8) | datazhi[i + 1]) & 0xFFFF;
  //   const xRaw = xRaw16 >= 0x8000 ? xRaw16 - 0x10000 : xRaw16;
  //   result.acc.x.push(xRaw);
  //   result.acc.x_g.push(xRaw / 2048);

  //   // 解析y轴
  //   const yRaw16 = ((datazhi[i + 2] << 8) | datazhi[i + 3]) & 0xFFFF;
  //   const yRaw = yRaw16 >= 0x8000 ? yRaw16 - 0x10000 : yRaw16;
  //   result.acc.y.push(yRaw);
  //   result.acc.y_g.push(yRaw / 2048);

  //   // 解析z轴
  //   const zRaw16 = ((datazhi[i + 4] << 8) | datazhi[i + 5]) & 0xFFFF;
  //   const zRaw = zRaw16 >= 0x8000 ? zRaw16 - 0x10000 : zRaw16;
  //   result.acc.z.push(zRaw);
  //   result.acc.z_g.push(zRaw / 2048);
  // }
  // for (let i = 0; i <= datazhi.length - 6; i += 6) {
  //   // 解析x轴：先组合为16位无符号数，再转换为有符号数
  //   const xRaw16 = datazhi[i + 1].toString(2).padStart(8, '0') + datazhi[i].toString(2).padStart(8, '0');
  //   const xRaw = xRaw16[0] == 1;
  //   result.acc.x.push(xRaw ? parseInt(xRaw16, 2) * -1 : parseInt(xRaw16, 2));
  //   result.acc.x_g.push(xRaw ? parseInt(xRaw16, 2) * -1 / 2048 : parseInt(xRaw16, 2) / 2048);

  //   // 解析y轴
  //   const yRaw16 = datazhi[i + 3].toString(2).padStart(8, '0') + datazhi[i + 2].toString(2).padStart(8, '0');
  //   const yRaw = yRaw16[0] == 1;
  //   result.acc.y.push(yRaw ? parseInt(yRaw16, 2) * -1 : parseInt(yRaw16, 2));
  //   result.acc.y_g.push(yRaw ? parseInt(yRaw16, 2) * -1 / 2048 : parseInt(yRaw16, 2) / 2048);

  //   // 解析z轴
  //   const zRaw16 = datazhi[i + 5].toString(2).padStart(8, '0') + datazhi[i + 4].toString(2).padStart(8, '0');
  //   const zRaw = zRaw16[0] == 1;
  //   result.acc.z.push(zRaw ? parseInt(zRaw16, 2) * -1 : parseInt(zRaw16, 2));
  //   result.acc.z_g.push(zRaw ? parseInt(zRaw16, 2) * -1 / 2048 : parseInt(zRaw16, 2) / 2048);
  // }

  // for (let i = 0; i <= datazhi.length - 6; i += 6) {
  //   // 解析x轴：先组合为16位无符号数，再转换为有符号数
  //   const xRaw16 = datazhi[i].toString(2).padStart(8, '0') + datazhi[i + 1].toString(2).padStart(8, '0');
  //   const xRaw = xRaw16[0] == 1;
  //   result.acc.x.push(xRaw ? parseInt(xRaw16, 2) * -1 : parseInt(xRaw16, 2));
  //   result.acc.x_g.push(xRaw ? parseInt(xRaw16, 2) * -1 / 2048 : parseInt(xRaw16, 2) / 2048);

  //   // 解析y轴
  //   const yRaw16 = datazhi[i + 2].toString(2).padStart(8, '0') + datazhi[i + 3].toString(2).padStart(8, '0');
  //   const yRaw = yRaw16[0] == 1;
  //   result.acc.y.push(yRaw ? parseInt(yRaw16, 2) * -1 : parseInt(yRaw16, 2));
  //   result.acc.y_g.push(yRaw ? parseInt(yRaw16, 2) * -1 / 2048 : parseInt(yRaw16, 2) / 2048);

  //   // 解析z轴
  //   const zRaw16 = datazhi[i + 4].toString(2).padStart(8, '0') + datazhi[i + 5].toString(2).padStart(8, '0');
  //   const zRaw = zRaw16[0] == 1;
  //   result.acc.z.push(zRaw ? parseInt(zRaw16, 2) * -1 : parseInt(zRaw16, 2));
  //   result.acc.z_g.push(zRaw ? parseInt(zRaw16, 2) * -1 / 2048 : parseInt(zRaw16, 2) / 2048);
  // }

  for (let i = 0; i <= datazhi.length - 6; i += 6) {
    // 解析x轴：先组合为16位无符号数，再转换为有符号数
    const xRaw16 = datazhi[i].toString(2).padStart(8, '0') + datazhi[i + 1].toString(2).padStart(8, '0');
    const xRaw = xRaw16[0] == 1;
    result.acc.x.push(xRaw ? (~parseInt(xRaw16, 2) + 1) * -1 : parseInt(xRaw16, 2));
    result.acc.x_g.push(xRaw ? (~parseInt(xRaw16, 2) + 1) * -1 / 2048 : parseInt(xRaw16, 2) / 2048);

    // 解析y轴
    const yRaw16 = datazhi[i + 2].toString(2).padStart(8, '0') + datazhi[i + 3].toString(2).padStart(8, '0');
    const yRaw = yRaw16[0] == 1;
    result.acc.y.push(yRaw ? (~parseInt(yRaw16, 2) + 1) * -1 : parseInt(yRaw16, 2));
    result.acc.y_g.push(yRaw ? (~parseInt(yRaw16, 2) + 1) * -1 / 2048 : parseInt(yRaw16, 2) / 2048);

    // 解析z轴
    const zRaw16 = datazhi[i + 4].toString(2).padStart(8, '0') + datazhi[i + 5].toString(2).padStart(8, '0');
    const zRaw = zRaw16[0] == 1;
    result.acc.z.push(zRaw ? (~parseInt(zRaw16, 2) + 1) * -1 : parseInt(zRaw16, 2));
    result.acc.z_g.push(zRaw ? (~parseInt(zRaw16, 2) + 1) * -1 / 2048 : parseInt(zRaw16, 2) / 2048);
  }
  console.log('没有转换单位x轴的第一个值');
  console.log(result.acc.x[0]);
  console.log('转换单位后x轴的第一个值');
  console.log(result.acc.x_g[0]);
  return result;
}
let xindianaccfun = null;
export function xindianacc(callback, zhi = 1) {
  xindianaccfun = callback;
}