/**
 * 初始化蓝牙模块
 */
export function initBluetooth() {

  return new Promise((resolve, reject) => {
    uni.openBluetoothAdapter({
      success: (res) => {
        console.log("蓝牙初始化成功", res);
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
// 回调函数
let getDataCallBack = null

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
 * 开始搜索蓝牙设备
 */
export function startScanBluetooth() {
  return new Promise((resolve, reject) => {
    uni.startBluetoothDevicesDiscovery({
      services: ['MPPB'],
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
// // 监听蓝牙连接状态变化
// uni.onBLEConnectionStateChange(res => {
//   console.log("连接状态变化:", res.connected);
//   if (res.connected) {
//     console.log("设备已连接，准备获取服务...");
//     setTimeout(() => {
//       handleBLEDeviceServices(res.deviceId); // 把 deviceId 传递给实际处理函数 
//     }, 2000)

//   } else {
//     console.warn("设备断开连接", res.deviceId);
//   }
// });

// 实际处理 BLE 服务发现逻辑
function handleBLEDeviceServices(deviceId) {
  console.log("开始获取服务，deviceId:", deviceId);

  if (!deviceId) {
    console.error("无效的 deviceId");
    return;
  }

  const serviceId = '6e4000f1-b5a3-f393-e0a9-e50e24dcca9e';
  const characteristicId = '6e4000f3-b5a3-f393-e0a9-e50e24dcca9e';

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
                // console.log("收到设备数据：", res.value);
                if (getDataCallBack) {
                  getDataCallBack(res.value)
                }
                // const data = new Uint8Array(res.value);
                // console.log("解析后的字节数组：", data);
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
export function connectToDevice(deviceId, callBack) {
  console.log('连接的id', deviceId);
  getDataCallBack = callBack
  return new Promise((resolve, reject) => {
    uni.createBLEConnection({
      deviceId,
      success: () => {
        console.log("连接蓝牙设备成功");
      },
      fail: (err) => {
        console.error("连接蓝牙设备失败", err);
        reject(err);
      }
    });
  });
}