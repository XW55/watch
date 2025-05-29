import filterUtils from '@/pageCheck/components/new12daojisuan.js';
import store from '@/store'

function formatString(str) {
  // 将字符串按两字一组分割
  let result = [];
  for (let i = 0; i < str.length; i += 2) {
    // 取每两字符并添加 '0x' 前缀，后加空格
    let pair = str.substring(i, i + 2);
    result.push('0x' + pair);
  }

  // 将数组中的元素用空格连接起来，去掉最后一个元素的空格
  return result.join(' ');
}
// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  const hexArr = Array.prototype.map.call(new Uint8Array(buffer), function(bit) {
    return ('00' + bit.toString(16)).slice(-2);
  });
  return hexArr.join('');
}


/**
 * 初始化蓝牙模块
 */
export function initBluetooth() {
  return new Promise((resolve, reject) => {
    uni.openBluetoothAdapter({
      success: (res) => {
        console.log("蓝牙初始化成功", res);
        // uni.setStorageSync('blestate', true);
        resolve(res);
      },
      fail: (err) => {
        console.error("蓝牙初始化失败", err);
        reject(err);
      }
    });
  });
}
// 设备数组
let discoveredDevices = [];

// 监听新设备发现事件
uni.onBluetoothDeviceFound((res) => {
  res.devices.forEach(device => {
    // 避免重复添加同一个设备
    if (!discoveredDevices.some(d => d.deviceId === device.deviceId)) {
      discoveredDevices.push(device);
    }
  });
});

/**
 * 停止搜索蓝牙设备
 */
export function stopScanBluetooth() {
  return new Promise((resolve, reject) => {
    uni.stopBluetoothDevicesDiscovery({
      success: () => {
        console.log("已停止蓝牙搜索");
        resolve();
      },
      fail: (err) => {
        console.error("停止搜索失败", err);
        reject(err);
      }
    });
  });
  uni.closeBluetoothAdapter({
    success(res) {

    }
  })
}

/**
 * 断开蓝牙连接
 * @param {string} deviceId - 设备ID
 */
export function disconnectBluetooth(deviceId) {
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
/**
 * 获取当前已发现的设备列表
 */
export function getDiscoveredDevices() {
  return [...discoveredDevices];
}
/**
 * 搜索蓝牙设备
 */
export function startScanBluetooth() {
  return new Promise((resolve, reject) => {
    uni.startBluetoothDevicesDiscovery({
      services: ['6e400003-b5a3-f393-e0a9-e50e24dcca9e'],
      success: () => {
        console.log("开始搜索蓝牙设备");
        resolve();
      },
      fail: (err) => {
        console.error("启动蓝牙搜索失败", err);
        reject(err);
      }
    });
  });
}
// 监听蓝牙连接状态变化
uni.onBLEConnectionStateChange(res => {
  console.log("连接状态变化:", res.connected);
  if (res.connected) {
    console.log("设备已连接，准备获取服务...");
    setTimeout(() => {
      handleBLEDeviceServices(res.deviceId); // 把 deviceId 传递给实际处理函数 
    }, 2000)

  } else {
    console.warn("设备断开连接", res.deviceId);
    store.commit('setble');
  }
});

let zijie = 1;


let qiehuan = true;


let setzhuye = null;
export function setzhuyes(callback) {
  setzhuye = callback;
}
let setfuye = null;
export function setfuyes(callbacks) {
  setfuye = callbacks;
}
/**
 * 修改切换
 */
export function getqiehuan(zhi = true) {
  qiehuan = zhi
}
let onDataCallback = null;
export function setOnDataParsed(callback) {
  onDataCallback = callback;
}
let kaishijieshou = false;
export function setkaishijieshou(callback) {
  kaishijieshou = callback;
  console.log(`开始接收数据了吗${kaishijieshou?'开始了':'没有'}`);
}
// 实际处理 BLE 服务发现逻辑
function handleBLEDeviceServices(deviceId) {
  console.log("开始获取服务，deviceId:", deviceId);
  let data = '';
  let zhi = false;
  let ecgData = [];
  let I = [];
  let II = [];
  let III = [];
  let V1 = [];
  let V2 = [];
  let V3 = [];
  let V4 = [];
  let V5 = [];
  let V6 = [];
  let aVR = [];
  let aVL = [];
  let aVF = [];
  let wanzhegnshuju = {
    I: [],
    II: [],
    III: [],
    V1: [],
    V2: [],
    V3: [],
    V4: [],
    V5: [],
    V6: [],
    aVR: [],
    aVL: [],
    aVF: []
  };
  if (!deviceId) {
    console.error("无效的 deviceId");
    return;
  }

  const serviceId = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';
  const characteristicId = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';

  uni.getBLEDeviceServices({
    deviceId,
    success: (servicesRes) => {
      console.log('服务列表:', servicesRes.services);

      if (!servicesRes.services || servicesRes.services.length === 0) {
        console.error("服务列表为空");
        uni.closeBluetoothAdapter({
          success(res) {

          }
        })
        return;
      }

      const foundService = servicesRes.services.find(s => s.uuid.toLowerCase() === serviceId.toLowerCase());
      if (!foundService) {
        console.error("未找到指定服务 UUID");
        uni.closeBluetoothAdapter({
          success(res) {

          }
        })
        return;
      }

      uni.getBLEDeviceCharacteristics({
        deviceId,
        serviceId,
        success: (charRes) => {
          const foundChar = charRes.characteristics.find(c => c.uuid.toLowerCase() === characteristicId
            .toLowerCase());
          if (!foundChar) {
            console.error("未找到指定特征值 UUID");
            uni.closeBluetoothAdapter({
              success(res) {

              }
            })
            return;
          }

          uni.notifyBLECharacteristicValueChange({
            deviceId,
            serviceId,
            characteristicId,
            state: true,
            success: () => {
              console.log("启用通知成功");

              // 开始监听数据
              uni.onBLECharacteristicValueChange(res => {
                // console.log(res);
                // console.log(res.value);
                // console.log(JSON.stringify(res.value));
                if (!kaishijieshou) return
                if (zhi) {
                  data = data + ' ' + formatString(ab2hex(res.value));
                  let hexArray = data.split(' ');
                  console.log(hexArray);
                  console.log(hexArray.length);
                  let jiexi = hexArray.slice(11, 251);
                  let results = [];
                  for (let i = 0; i < jiexi.length; i += 3) {
                    // 将每组三个十六进制数转换为十进制值并合并
                    let group = jiexi.slice(i, i + 3).map((hex) => parseInt(hex, 16));
                    // 计算合并值，这里我们将三个值合并成一个 24 位的整数
                    let combinedValue = ((group[0] << 24) | (group[1] << 16) | (group[2] << 8)) /
                      255;
                    // let combinedValue = (group[0] << 16) | (group[1] << 8) | group[2];
                    combinedValue = (combinedValue * 2.5 * 1000) / (2 ** 23 - 1) / 6;
                    results.push(combinedValue);
                  }
                  const resultdata = Array.from({
                    length: 8
                  }, () => []);
                  // 遍历原数组，将元素按照索引分配到相应的数组中
                  results.forEach((item, index) => {
                    resultdata[index % 8].push(item);
                  });
                  // console.log(results);
                  //III
                  resultdata[8] = resultdata[2].map((value, index) => value - resultdata[1][
                    index
                  ]);
                  //aVR
                  resultdata[9] = resultdata[1].map((value, index) => -(value + resultdata[2][
                    index
                  ]) / 2);
                  //aVL
                  resultdata[10] = resultdata[1].map((value, index) => (value - resultdata[2][
                    index
                  ]) / 2);
                  //aVF
                  resultdata[11] = resultdata[2].map((value, index) => (value - resultdata[1][
                    index
                  ]) / 2);
                  // console.log(resultdata);
                  I = I.concat(resultdata[1]);
                  II = II.concat(resultdata[2]);
                  V1 = V1.concat(resultdata[7]);
                  V2 = V2.concat(resultdata[3]);
                  V3 = V3.concat(resultdata[4]);
                  V4 = V4.concat(resultdata[5]);
                  V5 = V5.concat(resultdata[6]);
                  V6 = V6.concat(resultdata[0]);
                  // console.log(II.length);
                  if (zijie % 500 == 0) {
                    let dataArys = [
                      I.slice(0, 5000).map((value) => Math.floor(value * 1000)),
                      II.slice(0, 5000).map((value) => Math.floor(value * 1000)),
                      V1.slice(0, 5000).map((value) => Math.floor(value * 1000)),
                      V2.slice(0, 5000).map((value) => Math.floor(value * 1000)),
                      V3.slice(0, 5000).map((value) => Math.floor(value * 1000)),
                      V4.slice(0, 5000).map((value) => Math.floor(value * 1000)),
                      V5.slice(0, 5000).map((value) => Math.floor(value * 1000)),
                      V6.slice(0, 5000).map((value) => Math.floor(value * 1000))
                    ];
                    I = I.slice(5000);
                    II = II.slice(5000);
                    V1 = V1.slice(5000);
                    V2 = V2.slice(5000);
                    V3 = V3.slice(5000);
                    V4 = V4.slice(5000);
                    V5 = V5.slice(5000);
                    V6 = V6.slice(5000);
                    if (onDataCallback) onDataCallback(dataArys);
                  }
                  zijie++;
                  wanzhegnshuju.I = wanzhegnshuju.I.concat(resultdata[1]);
                  wanzhegnshuju.II = wanzhegnshuju.II.concat(resultdata[2]);
                  wanzhegnshuju.III = wanzhegnshuju.III.concat(resultdata[8]);
                  wanzhegnshuju.V1 = wanzhegnshuju.V1.concat(resultdata[7]);
                  wanzhegnshuju.V2 = wanzhegnshuju.V2.concat(resultdata[3]);
                  wanzhegnshuju.V3 = wanzhegnshuju.V3.concat(resultdata[4]);
                  wanzhegnshuju.V4 = wanzhegnshuju.V4.concat(resultdata[5]);
                  wanzhegnshuju.V5 = wanzhegnshuju.V5.concat(resultdata[6]);
                  wanzhegnshuju.V6 = wanzhegnshuju.V6.concat(resultdata[0]);
                  wanzhegnshuju.aVR = wanzhegnshuju.aVR.concat(resultdata[9]);
                  wanzhegnshuju.aVL = wanzhegnshuju.aVL.concat(resultdata[10]);
                  wanzhegnshuju.aVF = wanzhegnshuju.aVF.concat(resultdata[11]);
                  let changdu = 1250; //500
                  if (qiehuan ? wanzhegnshuju.II.length > 500 : wanzhegnshuju.II.length >
                    changdu) {
                    if (qiehuan) {
                      const disDataAry = wanzhegnshuju.II.slice(-500);
                      const okDataAry = filterUtils.wlFilter(disDataAry);
                      ecgData = okDataAry;
                      try {
                        setzhuye(ecgData)
                      } catch (e) {
                        console.log('刚采集数据画II导联报错');
                        console.log(e);
                      }
                      wanzhegnshuju.II = [];
                    } else {
                      ecgData = [
                        filterUtils.wlFilter(wanzhegnshuju.I.slice(changdu * -1)),
                        filterUtils.wlFilter(wanzhegnshuju.II.slice(changdu * -1)),
                        filterUtils.wlFilter(wanzhegnshuju.III.slice(changdu * -1)),
                        filterUtils.wlFilter(wanzhegnshuju.aVR.slice(changdu * -1)),
                        filterUtils.wlFilter(wanzhegnshuju.aVL.slice(changdu * -1)),
                        filterUtils.wlFilter(wanzhegnshuju.aVF.slice(changdu * -1)),
                        filterUtils.wlFilter(wanzhegnshuju.V1.slice(changdu * -1)),
                        filterUtils.wlFilter(wanzhegnshuju.V2.slice(changdu * -1)),
                        filterUtils.wlFilter(wanzhegnshuju.V3.slice(changdu * -1)),
                        filterUtils.wlFilter(wanzhegnshuju.V4.slice(changdu * -1)),
                        filterUtils.wlFilter(wanzhegnshuju.V5.slice(changdu * -1)),
                        filterUtils.wlFilter(wanzhegnshuju.V6.slice(changdu * -1))
                      ];
                      try {
                        setfuye(ecgData)
                      } catch (e) {
                        console.log(`12导画图出错${e}`);
                      }
                      wanzhegnshuju.I = [];
                      wanzhegnshuju.II = [];
                      wanzhegnshuju.III = [];
                      wanzhegnshuju.aVR = [];
                      wanzhegnshuju.aVL = [];
                      wanzhegnshuju.aVF = [];
                      wanzhegnshuju.V1 = [];
                      wanzhegnshuju.V2 = [];
                      wanzhegnshuju.V3 = [];
                      wanzhegnshuju.V4 = [];
                      wanzhegnshuju.V5 = [];
                      wanzhegnshuju.V6 = [];
                    }
                  }
                  zhi = false;
                } else {
                  data = formatString(ab2hex(res.value));
                  zhi = true;
                }
              });
            },
            fail: err => {
              console.error("启用通知失败", err);
            }
          });

        },
        fail: err => {
          console.error("获取特征值失败", err);
        }
      });

    },
    fail: err => {
      console.error("获取服务失败", err);
    }
  });
}
/**
 * 连接并订阅指定蓝牙设备的通知
 * @param {string} deviceId - 蓝牙设备ID
 */


let gecdata = null;
export function yilianjieshebei(callback) {
  gecdata = callback
}
let shibaigecdata = null;
export function shibaiyilianjieshebei(callback) {
  shibaigecdata = callback
}
/**
 * 连接ble设备
 * @param {string} deviceId - 蓝牙设备
 */
export function connectToDevice(item) {
  console.log('连接的id', item.deviceId);
  return new Promise((resolve, reject) => {
    uni.createBLEConnection({
      deviceId: item.deviceId,
      success: () => {
        gecdata(item)
        console.log("连接蓝牙设备成功");
      },
      fail: (err) => {
        shibaigecdata()
        console.error("连接蓝牙设备失败", err);
        reject(err);
      }
    });
  });
}

let duankaiChenggong = null;
export function huidiaoDuankaiChenggong(callback) {
  duankaiChenggong = callback
}
let duankaiShibai = null;
export function huidiaoDuankaiShibai(callback) {
  duankaiShibai = callback
}
/**
 * 断开ble设备
 * @param {string} deviceId - 蓝牙设备
 */
export function brokenLink(item) {
  console.log('断开设备的id', item.deviceId);
  return new Promise((resolve, reject) => {
    uni.closeBLEConnection({
      deviceId: item.deviceId,
      success: () => {
        zijie = 1;
        duankaiChenggong()
        console.log("断开蓝牙设备成功");

      },
      fail: (err) => {
        console.error("断开蓝牙设备失败", err);
        duankaiShibai()

        reject(err);
      }
    });
  });
}