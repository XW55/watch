<template>
  <view>
    <view class="luang">
      <view class="shishishi">
        <view class="lanya">
          <view class="lanya_biaoti">
            <view class="">蓝牙设备</view>
            <view v-if="!yijingbleDevs.length > 0" @click="searchBluetooth" class="lianjeianniu">搜索</view>
          </view>
          <view class="shebielan">
            <view class="shebei" v-for="(item, index) in yijingbleDevs" :key="index">
              <view class="">已连接设备：{{ item.name }}</view>
              <view class="lianjeianniu" @click="close(item)">断开</view>
            </view>
          </view>
        </view>
        <view class="tankuang">
          <view class="biaotizhi">
            <view class="">搜索到的12导联设备为：</view>
            <view @click="quxiaosousuo" class="quxiao">取消</view>
          </view>
          <view class="shebeizhilan">
            <view class="shebei" v-for="(item, index) in bleDevs" :key="index">
              <view class="">设备：{{ item.name }}</view>
              <view class="lianjeianniu" @click="nowLinkLis(item)">连接</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      bleDevs: [],
      yijingbleDevs: []
    }
  },
  computed: {},
  onLoad(options) {},
  onShow() {},
  onUnload() {},

  //离开当前页面
  onUnload() {
    console.log('离开了')
    for (let i = 0; i < yijingbleDevs.length; i++) {
      this.close(yijingbleDevs[i])
    }
    uni.closeBluetoothAdapter({
      success(res) {
        console.log(`关闭蓝牙适配${res}`)
      }
    })
  },

  // 画图
  methods: {
    quxiaosousuo() {
      this.stopBluetoothDevicesDiscovery()
    },
    formatString(str) {
      let result = []
      for (let i = 0; i < str.length; i += 2) {
        let pair = str.substring(i, i + 2)
        result.push('0x' + pair)
      }
      return result.join(' ')
    },
    ab2hex(buffer) {
      const hexArr = Array.prototype.map.call(new Uint8Array(buffer), function (bit) {
        return ('00' + bit.toString(16)).slice(-2)
      })
      return hexArr.join('')
    },
    // 初始化蓝牙适配器并搜索设备
    searchBluetooth() {
      const that = this
      uni.openBluetoothAdapter({
        success: res => {
          //已打开
          uni.getBluetoothAdapterState({
            //蓝牙的匹配状态
            success: res1 => {
              // console.log(res1, "“本机设备的蓝牙已打开”");
              // 开始搜索蓝牙设备
              that.startBluetoothDiscovery()
            },
            fail(error) {
              uni.showToast({ icon: 'none', title: '查看手机蓝牙是否打开' })
            }
          })
        },
        fail: err => {
          //未打开
          uni.showToast({ icon: 'none', title: '查看手机蓝牙是否打开' })
        }
      })
    },

    // 开始蓝牙设备搜索
    startBluetoothDiscovery() {
      const that = this
      uni.startBluetoothDevicesDiscovery({
        success: res => {
          // console.log("启动成功", res);
          // 发现外围设备
          that.onBluetoothDeviceFound()
        },
        fail: err => {
          // console.log(err, "错误信息");
        }
      })
    },
    // 发现外围设备
    onBluetoothDeviceFound() {
      console.log('执行到这--发现外围设备')
      uni.onBluetoothDeviceFound(res => {
        if (res.devices[0].name == 'ZKMC ECG 12' || res.devices[0].name.startsWith('MP')) {
          console.log(res)
        }
        // 吧搜索到的设备存储起来，方便我们在页面上展示
        if (this.bleDevs.indexOf(res.devices[0]) == -1) {
          if (res.devices[0].name == 'ZKMC ECG 12' || res.devices[0].name.startsWith('MP')) {
            this.bleDevs.push(res.devices[0])
          }
        }
      })
    },

    // 停止搜寻蓝牙设备
    stopBluetoothDevicesDiscovery() {
      uni.stopBluetoothDevicesDiscovery({
        success: e => {},
        fail: e => {
          console.log('停止搜索蓝牙设备失败，错误码：' + e.errCode)
        }
      })
    },
    // 直接启用监听功能
    nowLinkLis(items) {
      console.log('----------')
      console.log(items)
      let that = this
      let zhi = false
      let data = ''
      uni.showLoading({
        title: '连接中，请稍等',
        mask: true
      })
      //连接蓝牙
      uni.createBLEConnection({
        deviceId: items.deviceId,
        success(res) {
          that.stopBluetoothDevicesDiscovery() // 停止搜索蓝牙
          if (items.name.startsWith('ZKMC')) {
            setTimeout(() => {
              uni.notifyBLECharacteristicValueChange({
                state: true, // 启用 notify 功能
                deviceId: items.deviceId,
                serviceId: '6E400003-B5A3-F393-E0A9-E50E24DCCA9E',
                characteristicId: '6E400003-B5A3-F393-E0A9-E50E24DCCA9E',
                success: res => {
                  console.log('启用监听了', res)
                  that.yijingbleDevs.push(items)
                  that.bleDevs = that.bleDevs.filter(dev => dev.name !== items.name)
                  uni.showToast({
                    title: '连接成功',
                    icon: 'success'
                  })
                  uni.hideLoading()
                  uni.onBLECharacteristicValueChange(res => {
                    if (zhi) {
                      data = data + ' ' + that.formatString(that.ab2hex(res.value))
                      let hexArray = data.split(' ')
                      console.log(hexArray)
                      console.log(hexArray.length)
                      let jiexi = hexArray.slice(11, 251)
                      // console.log(jiexi);
                      let results = []
                      for (let i = 0; i < jiexi.length; i += 3) {
                        // 将每组三个十六进制数转换为十进制值并合并
                        let group = jiexi.slice(i, i + 3).map(hex => parseInt(hex, 16))
                        // 计算合并值，这里我们将三个值合并成一个 24 位的整数
                        let combinedValue = ((group[0] << 24) | (group[1] << 16) | (group[2] << 8)) / 255
                        // let combinedValue = (group[0] << 16) | (group[1] << 8) | group[2];
                        combinedValue = (combinedValue * 2.5 * 1000) / (2 ** 23 - 1) / 6
                        results.push(combinedValue)
                      }
                      const resultdata = Array.from({ length: 8 }, () => [])
                      // 遍历原数组，将元素按照索引分配到相应的数组中
                      results.forEach((item, index) => {
                        resultdata[index % 8].push(item)
                      })
                      //III
                      resultdata[8] = resultdata[2].map((value, index) => value - resultdata[1][index])
                      //aVR
                      resultdata[9] = resultdata[1].map((value, index) => -(value + resultdata[2][index]) / 2)
                      //aVL
                      resultdata[10] = resultdata[1].map((value, index) => (value - resultdata[2][index]) / 2)
                      //aVF
                      resultdata[11] = resultdata[2].map((value, index) => (value - resultdata[1][index]) / 2)
                      zhi = false
                    } else {
                      data = that.formatString(that.ab2hex(res.value))
                      zhi = true
                    }
                  })
                },
                fail: res => {
                  console.log('启用 notify 功能失败', res)
                  uni.hideLoading()
                  uni.showToast({ title: '连接失败', icon: 'none' })
                }
              })
            }, 800)
          } else {
            setTimeout(() => {
              uni.notifyBLECharacteristicValueChange({
                state: true, // 启用 notify 功能
                deviceId: items.deviceId,
                serviceId: '6e4000f1-b5a3-f393-e0a9-e50e24dcca9e',
                characteristicId: '6e4000f3-b5a3-f393-e0a9-e50e24dcca9e',
                success: res => {
                  console.log('启用监听了', res)
                  that.yijingbleDevs.push(items)
                  that.bleDevs = that.bleDevs.filter(dev => dev.name !== items.name)
                  uni.showToast({
                    title: '连接成功',
                    icon: 'success'
                  })
                  uni.hideLoading()
                  uni.onBLECharacteristicValueChange(res => {
                    const data = new Uint8Array(res.value)
                    console.log('解析后的字节数组：', data)
                  })
                },
                fail: res => {
                  console.log('启用 notify 功能失败', res)
                  uni.hideLoading()
                  uni.showToast({ title: '连接失败', icon: 'none' })
                }
              })
            }, 800)
          }
        },
        fail(res) {
          console.log('蓝牙连接失败', res)
          uni.showToast({
            title: '连接失败',
            icon: 'none'
          })
        }
      })
    },
    // 断开蓝牙连接
    close(item) {
      let that = this
      uni.closeBLEConnection({
        deviceId: item.deviceId,
        success(res) {
          console.log(`${item.deviceId}断开成功`)
          // 从 yijingbleDevs 中移除 name 等于 item.name 的项
          that.yijingbleDevs = that.yijingbleDevs.filter(dev => dev.name !== item.name)
        },
        fail(res) {
          console.log(`${item.deviceId}断开失败`)
        }
      })
    }
  }
}
</script>

<style>
page {
  background: linear-gradient(180deg, #d9fff1, #fff);
  background-repeat: no-repeat;
}
</style>
<style scoped>
view,
text {
  box-sizing: border-box;
}
</style>
<style lang="scss" scoped>
.shishishi {
  height: 100%;
  overflow-y: auto;
}

.luang {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}
</style>

<style lang="scss" scoped>
.lanya {
  width: 92%;
  background-color: pink;
  margin: 20rpx auto 0 auto;
  background-color: #fff;
  border-radius: 14rpx;
  padding: 20rpx;
  &_biaoti {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
.lianjeianniu {
  background-color: #0c9;
  color: #fff;
  padding: 10rpx;
  border-radius: 14rpx;
}
.tankuang {
  z-index: 10000 !important;
  width: 92%;
  background-color: #fff;
  padding: 18rpx;
  margin: 18rpx auto 18rpx auto;
  border-radius: 14rpx;
}
.shebeizhilan {
  margin-top: 20rpx;
  height: 400rpx;
  overflow-y: auto;
}
.shebei {
  width: 100%;
  background-color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx;
  margin-top: 18rpx;
  border-radius: 14rpx;
}
.shebei:first-child {
  margin-top: 0;
}
.biaotizhi {
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.quxiao {
  background-color: #f8f8f8;
  color: #000;
  padding: 10rpx;
  border-radius: 14rpx;
}
</style>
