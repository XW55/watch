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
            uni.hideLoading();
            uni.onBLECharacteristicValueChange((res) => {
              if (res.serviceId == 'DE5BF728-D711-4E47-AF26-65E3012A5DC7') {
                xindiancishu = 0;
                xindiantiejiaxishuju(res.value)
              } else if (res.serviceId == '6E4000F1-B5A3-F393-E0A9-E50E24DCCA9E') {
                pidiancishu = 0;
                processIncomingData(res.value)
              }
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

function xindiantiejiaxishuju(value) {
  const unit8Arr = Array.from(new Uint8Array(value), byte => byte);
  // console.log(unit8Arr);
  // console.log(unit8Arr.length);
  // console.log(unit8Arr[0x01]);
  if (unit8Arr[0x01] == 0x32) {
    if (unit8Arr[0x06] == 0x02) {
      console.warn('导联脱落');
    }
  } else if (unit8Arr[0x01] == 0x31) {
    const result = parseEcgData(unit8Arr);
    if (result.success) {
      // console.log(`成功解析${result.pointsCount}个心电数据点`);
      let zhi = []
      result.dataPoints.forEach((point, index) => {
        zhi[index] = point.voltage * 1
      });
      // console.log(zhi);
      bledata(1, ['II'], zhi)
    } else {
      console.error("心电数据解析失败:", result.error);
      if (result.details) {
        console.error("详细信息:", result.details);
      }
    }
  } else if (unit8Arr[0x01] == 0x33) {
    const sensorDatass = parseIMUData(unit8Arr)
    xindianaccfun(sensorDatass.acc)
  }
}

/**
 * 解析心电数据数组
 * @param {Array} hexArray 十六进制字符串数组，如 ["0xbc", "0x31", ...]
 * @param {number} gainFactor 增益倍数，默认1000
 * @returns {Object} 解析结果对象
 */
function parseEcgData(byteArray, gainFactor = 1000) {
  // // 2. 基础格式验证
  // if (byteArray.length < 6) {
  //   return {
  //     success: false,
  //     error: '数据长度不足，无法解析'
  //   };
  // }

  // // 验证魔数和指令类型
  // if (byteArray[0] !== 0xBC || byteArray[1] !== 0x31) {
  //   return {
  //     success: false,
  //     error: '无效的指令格式，非ECG_DATA数据',
  //     details: {
  //       magicByte: byteArray[0],
  //       command: byteArray[1]
  //     }
  //   };
  // }

  // // 3. 解析数据长度（小端模式）
  // const dataLength = byteArray[2] + (byteArray[3] << 8);

  // // 4. 解析校验和（小端模式）
  // const receivedChecksum = byteArray[4] + (byteArray[5] << 8);

  // // 5. 计算数据区校验和
  // let calculatedChecksum = 0;
  // for (let i = 6; i < byteArray.length; i++) {
  //   calculatedChecksum += byteArray[i];
  // }

  // // 6. 校验和验证
  // if (calculatedChecksum !== receivedChecksum) {
  //   return {
  //     success: false,
  //     error: '数据校验和错误',
  //     details: {
  //       received: receivedChecksum,
  //       calculated: calculatedChecksum
  //     }
  //   };
  // }

  // // 7. 数据长度验证
  // if (byteArray.length - 6 !== dataLength) {
  //   return {
  //     success: false,
  //     error: '数据长度不匹配',
  //     details: {
  //       expected: dataLength,
  //       actual: byteArray.length - 6
  //     }
  //   };
  // }

  // 8. 解析心电数据点
  const dataPoints = [];
  for (let i = 10; i < byteArray.length; i += 2) {
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
    pointsCount: dataPoints.length,
    dataPoints: dataPoints
  };
}

let xindianaccfun = null;
export function xindianacc(callback, zhi = 1) {
  xindianaccfun = callback;
}


/**
 * 计算角速度值
 * @param {Array} data - 数据数组
 * @param {number} index - 起始索引
 * @returns {number} 角速度值 (°/s)
 */
function calculateGyro(data, index) {
  // 小端模式读取两个字节
  const lowByte = data[index];
  const highByte = data[index + 1];

  // 组合成16位整数
  const gyro = (highByte << 8) | lowByte;

  // 应用公式计算角速度 (°/s)
  // 公式: gyro_g = (float)gyro * 2000 / 32768
  return (gyro * 2000) / 32768;
}

// 金辉有符号处理
function parseIMUData(zhi) {
  let dataBytes = zhi.slice(-120);
  // console.log(dataBytes);
  // console.log(dataBytes);
  const accXArray = [],
    accYArray = [],
    accZArray = [];
  const gyroXArray = [],
    gyroYArray = [],
    gyroZArray = [];

  for (let i = 0; i < dataBytes.length; i += 12) {
    if (i + 11 >= dataBytes.length) break;

    // 加速度计解析（大端）
    const accX = (dataBytes[i] << 8) | dataBytes[i + 1];
    const accY = (dataBytes[i + 2] << 8) | dataBytes[i + 3];
    const accZ = (dataBytes[i + 4] << 8) | dataBytes[i + 5];

    // 陀螺仪解析（大端）
    const gyroX = (dataBytes[i + 6] << 8) | dataBytes[i + 7];
    const gyroY = (dataBytes[i + 8] << 8) | dataBytes[i + 9];
    const gyroZ = (dataBytes[i + 10] << 8) | dataBytes[i + 11];

    // 有符号处理
    const toSigned16 = (v) => v > 32767 ? v - 65536 : v;

    // 单位转换
    accXArray.push(toSigned16(accX) * 16 / 32768);
    accYArray.push(toSigned16(accY) * 16 / 32768);
    accZArray.push(toSigned16(accZ) * 16 / 32768);

    gyroXArray.push(toSigned16(gyroX) * 2000 / 32768);
    gyroYArray.push(toSigned16(gyroY) * 2000 / 32768);
    gyroZArray.push(toSigned16(gyroZ) * 2000 / 32768);
  }

  return {
    acc: {
      x: accXArray,
      y: accYArray,
      z: accZArray,
      x_g: gyroXArray,
      y_g: gyroYArray,
      z_g: gyroZArray
    },
    gyro: {
      x: gyroXArray,
      y: gyroYArray,
      z: gyroZArray
    }
  };
}