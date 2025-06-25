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
    deviceSn: uni.getStorageSync('xindian').name || 'ZKMC ECG 12',
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
let xindiandingshiqi = null;
let xindianshijian = 1000;
let xindiancishu = 0;
let pidiandingshiqi = null;
let pidianshijian = 2000;
let pidiancishu = 0;
let setzhuye = null;
// 监听蓝牙连接状态变化
uni.onBLEConnectionStateChange(res => {
  if (!res.connected) {
    console.warn("设备断开连接", res.deviceId);
    console.warn('\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\');
    console.warn(res);
    if (uni.getStorageSync('xindian')?.deviceId == res.deviceId && !res.connected) {
      if (xindiandingshiqi) {
        clearInterval(xindiandingshiqi)
        xindiandingshiqi = null
      }
      xindiandingshiqi = setInterval(() => {
        nowLinkLisjs(uni.getStorageSync('xindian'), 1, () => {
          console.log('心电电设备重连');
          if (xindiancishu == 5) {
            clearInterval(xindiandingshiqi)
            xindiancishu = 0;
            vueStore.commit('SET_XINDIANBLE', '');
            uni.showToast({
              title: '心电设备重连失败',
              icon: 'error',
              duration: 2000
            });
          } else {
            xindiancishu++
          }
        });
      }, xindianshijian)
    } else if (uni.getStorageSync('pidian')?.deviceId == res.deviceId && !res.connected) {
      if (pidiandingshiqi) {
        clearInterval(pidiandingshiqi)
        pidiandingshiqi = null
      }
      pidiandingshiqi = setInterval(() => {
        nowLinkLisjs(uni.getStorageSync('pidian'), 1, () => {
          console.log('皮电设备重连');
          if (pidiancishu == 5) {
            clearInterval(pidiandingshiqi)
            pidiancishu = 0;
            vueStore.commit('SET_PIDIANBLE', '');
            uni.showToast({
              title: '皮电设备重连失败',
              icon: 'error',
              duration: 2000
            });
          } else {
            pidiancishu++
          }
        });
      }, pidianshijian)
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
  // guid = GUID();
  let zhi = false;
  let data = '';
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
  console.log('items', items);
  uni.showLoading({
    title: '连接中，请稍等',
    mask: true
  });
  //连接蓝牙
  uni.createBLEConnection({
    deviceId: items.deviceId,
    success(res) {
      stopBluetoothDevicesDiscovery(); // 停止搜索蓝牙
      huidiao()
      setTimeout(() => {
        uni.notifyBLECharacteristicValueChange({
          state: true, // 启用 notify 功能
          deviceId: items.deviceId,
          serviceId: items.name.startsWith('MP') ?
            '6e4000f1-b5a3-f393-e0a9-e50e24dcca9e' : '6E400003-B5A3-F393-E0A9-E50E24DCCA9E',
          characteristicId: items.name.startsWith('MP') ?
            '6e4000f3-b5a3-f393-e0a9-e50e24dcca9e' : '6E400003-B5A3-F393-E0A9-E50E24DCCA9E',
          success: (res) => {
            // console.log('启用监听了', res);
            if (pidiandingshiqi) {
              clearInterval(pidiandingshiqi)
              pidiandingshiqi = null
              pidiancishu = 0;
            }
            if (xindiandingshiqi) {
              clearInterval(xindiandingshiqi)
              xindiandingshiqi = null
              xindiancishu = 0;
            }
            uni.hideLoading();
            uni.onBLECharacteristicValueChange((res) => {
              // console.log('-------------');
              // console.log(res);
              // console.log(kaishijieshou);
              if (kaishijieshou) {
                if (res.serviceId == '6E400003-B5A3-F393-E0A9-E50E24DCCA9E') {
                  if (zhi) {
                    data = data + ' ' + formatString(ab2hex(res.value));
                    let hexArray = data.split(' ');
                    // console.log(hexArray);
                    // console.log(hexArray.length);
                    let jiexi = hexArray.slice(11, 251);
                    // console.log(jiexi);
                    let results = [];
                    for (let i = 0; i < jiexi.length; i += 3) {
                      // 将每组三个十六进制数转换为十进制值并合并
                      let group = jiexi.slice(i, i + 3).map((hex) => parseInt(hex, 16));
                      // 计算合并值，这里我们将三个值合并成一个 24 位的整数
                      let combinedValue = ((group[0] << 24) | (group[1] << 16) | (group[2] <<
                          8)) /
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
                    I = I.concat(resultdata[1]);
                    II = II.concat(resultdata[2]);
                    V1 = V1.concat(resultdata[7]);
                    V2 = V2.concat(resultdata[3]);
                    V3 = V3.concat(resultdata[4]);
                    V4 = V4.concat(resultdata[5]);
                    V5 = V5.concat(resultdata[6]);
                    V6 = V6.concat(resultdata[0]);
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
                      // if (onDataCallback) onDataCallback(dataArys);
                      if (shangchuan) {
                        uploadDataL_LTP(dataArys)
                      }
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
                        ecgData = []
                      } else {
                        ecgData = [{
                          data: ecgConfig({
                            name: 'I',
                            data: filterUtils.wlFilter(wanzhegnshuju.I.slice(changdu * -
                              1))
                          })
                        }, {
                          data: ecgConfig({
                            name: 'II',
                            data: filterUtils.wlFilter(wanzhegnshuju.II.slice(changdu *
                              -1))
                          })
                        }, {
                          data: ecgConfig({
                            name: 'III',
                            data: filterUtils.wlFilter(wanzhegnshuju.III.slice(changdu *
                              -
                              1))
                          })
                        }, {
                          data: ecgConfig({
                            name: 'aVR',
                            data: filterUtils.wlFilter(wanzhegnshuju.aVR.slice(changdu *
                              -
                              1))
                          })
                        }, {
                          data: ecgConfig({
                            name: 'aVL',
                            data: filterUtils.wlFilter(wanzhegnshuju.aVL.slice(changdu *
                              -
                              1))
                          })
                        }, {
                          data: ecgConfig({
                            name: 'aVF',
                            data: filterUtils.wlFilter(wanzhegnshuju.aVF.slice(changdu *
                              -
                              1))
                          })
                        }, {
                          data: ecgConfig({
                            name: 'V1',
                            data: filterUtils.wlFilter(wanzhegnshuju.V1.slice(changdu *
                              -1))
                          })
                        }, {
                          data: ecgConfig({
                            name: 'V2',
                            data: filterUtils.wlFilter(wanzhegnshuju.V2.slice(changdu *
                              -1))
                          })
                        }, {
                          data: ecgConfig({
                            name: 'V3',
                            data: filterUtils.wlFilter(wanzhegnshuju.V3.slice(changdu *
                              -1))
                          })
                        }, {
                          data: ecgConfig({
                            name: 'V4',
                            data: filterUtils.wlFilter(wanzhegnshuju.V4.slice(changdu *
                              -1))
                          })
                        }, {
                          data: ecgConfig({
                            name: 'V5',
                            data: filterUtils.wlFilter(wanzhegnshuju.V5.slice(changdu *
                              -1))
                          })
                        }, {
                          data: ecgConfig({
                            name: 'V6',
                            data: filterUtils.wlFilter(wanzhegnshuju.V6.slice(changdu *
                              -1))
                          })
                        }];
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
                        ecgData = []
                      }
                    }
                    zhi = false;
                  } else {
                    if (formatString(ab2hex(res.value)).trim().startsWith(
                        '0x00 0xaa 0x00 0xcc 0x00 0x00 0x00 0xaa')) {
                      data = formatString(ab2hex(res.value));
                      zhi = true;
                    }
                  }
                } else if (res.serviceId == '6E4000F1-B5A3-F393-E0A9-E50E24DCCA9E') {
                  processIncomingData(res.value)
                }
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
          }
        });
      }, 1000 * (index + 1));
    },
    fail(res) {
      console.log('蓝牙连接失败', res);
      uni.showToast({
        title: items.name + '连接失败',
        icon: 'none'
      });
    }
  });
}