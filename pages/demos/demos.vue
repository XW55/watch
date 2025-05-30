<template>
  <view class="content">
    <button type="default" v-show="!shows" @click="initBle">初始化蓝牙模块</button>
    <scroll-view scroll-y="true" show-scrollbar="true">
      <radio-group>
        <view
          v-for="(item, index) in bleDevs"
          :key="index"
          v-show="item.name.length > 0 && !shows"
          style="padding: 10rpx 20rpx; border-bottom: 1rpx solid #ececec"
          v-if="Math.max(100 + item.RSSI, 0) >= 30"
        >
          <view style="font-size: 32rpx; color: #333">
            <checkbox-group @change="checkboxChange" :data-name="item.name" :data-deviceId="item.deviceId">
              <label>
                <checkbox :value="item.deviceId">
                  {{ item.name }}
                </checkbox>
              </label>
            </checkbox-group>
          </view>
          <view style="font-size: 20rpx; padding: 10rpx 0">
            deviceId: {{ item.deviceId }} 信号强度: {{ item.RSSI }}dBm ({{ Math.max(100 + item.RSSI, 0) }}%)
          </view>
        </view>
        <view class="dis">
          <view @tap="connectBle" v-if="!shows" class="pl">连接</view>
          <view @tap="close" v-if="shows" class="pl">断开</view>
        </view>
      </radio-group>
    </scroll-view>
    <view class="appItems">
      <viwe :class="[item.status ? 'item bakBlue' : 'item']" v-for="(item, index) in totalList" :key="index">
        <view class="txt">{{ item.text }}</view>
        <view class="name p_hide">{{ item.name }}</view>
      </viwe>
    </view>
    <view class="items">
      <view class="item" v-for="(item, index) in getData" :key="index">{{ item.name }}：{{ item.txt }}</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      config: {
        color: '#333',
        backgroundColor: [1, '#fff'],
        title: '多设备蓝牙连接',
        back: false
      },
      title: 'Hello',
      bleDevs: [],
      status: -2, //-2未连接  -1已连接  0连接成功
      deviceId: '',
      serviceId: '',
      characteristicId: '',

      sendData: '',
      getData: [],

      deviceIds: [],
      totalList: [], // 全部已连接的设备

      timeIndex: 0, // 默认是列表的第一个

      timeout: null,
      shows: false,

      titleTime: '00:00:00',
      timer: '',

      hour: 0,
      minutes: 0,
      seconds: 0,

      input1: 'B',
      input2: '',
      sousuo: false
    };
  },
  destroyed() {
    clearInterval(this.timer);
  },
  onLoad() {},
  mounted() {
    this.onBLEConnectionStateChange();
  },
  methods: {
    checkboxChange(e) {
      if (e.target.value[0] && e.target.dataset.name) {
        let item = {
          deviceId: e.target.value[0],
          name: e.target.dataset.name
        };
        this.deviceIds.push(item);
      } else {
        for (let index = 0; index < this.deviceIds.length; index++) {
          let item = this.deviceIds[index];
          if (item.deviceId == e.target.dataset.deviceid) {
            this.deviceIds.splice(index, 1);
          }
        }
      }
    },
    hextoString(hex) {
      var arr = hex.split('');
      var out = '';
      for (var i = 0; i < arr.length / 2; i++) {
        var tmp = '0x' + arr[i * 2] + arr[i * 2 + 1];
        var charValue = String.fromCharCode(tmp);
        out += charValue;
      }
      return out;
    },
    formatString(str) {
      let result = [];
      for (let i = 0; i < str.length; i += 2) {
        let pair = str.substring(i, i + 2);
        result.push('0x' + pair);
      }
      return result.join(' ');
    },
    // ArrayBuffer转16进度字符串示例
    ab2hex(buffer) {
      const hexArr = Array.prototype.map.call(new Uint8Array(buffer), function (bit) {
        return ('00' + bit.toString(16)).slice(-2);
      });
      return hexArr.join('');
    },

    onBLEConnectionStateChange() {
      let that = this;
      uni.onBLEConnectionStateChange((res) => {
        // 该方法回调中可以用于处理连接意外断开等异常情况
        if (res.connected == false) {
          uni.hideLoading();
          for (let i = 0; i < this.deviceIds.length; i++) {
            if (res.deviceId == this.deviceIds[i].deviceId) {
              uni.showToast({
                title: this.deviceIds[i].name + ' 蓝牙设备断开连接',
                icon: 'none'
              });
            }
          }
        } else {
          setTimeout(() => {
            this.deviceIds.forEach((items) => {
              uni.notifyBLECharacteristicValueChange({
                state: true, // 启用 notify 功能
                deviceId: items.deviceId,
                serviceId: items.name.startsWith('MP')
                  ? '6e4000f1-b5a3-f393-e0a9-e50e24dcca9e'
                  : '6E400003-B5A3-F393-E0A9-E50E24DCCA9E',
                characteristicId: items.name.startsWith('MP')
                  ? '6e4000f3-b5a3-f393-e0a9-e50e24dcca9e'
                  : '6E400003-B5A3-F393-E0A9-E50E24DCCA9E',
                success: (res) => {
                  console.log('启用监听了', res);
                  that.shows = true;
                  uni.hideLoading();
                  items['status'] = true;
                  items['text'] = '';
                  that.totalList.push(items);
                  uni.onBLECharacteristicValueChange((res) => {
                    // console.log(res);
                    if (res.deviceId == 'D4:DA:6E:1A:15:86') {
                      if (zhi) {
                        data = data + ' ' + that.formatString(that.ab2hex(res.value));
                        let hexArray = data.split(' ');
                        // console.log(hexArray);
                        console.log(hexArray.length);
                        let jiexi = hexArray.slice(11, 251);
                        // console.log(jiexi);
                        let results = [];
                        for (let i = 0; i < jiexi.length; i += 3) {
                          // 将每组三个十六进制数转换为十进制值并合并
                          let group = jiexi.slice(i, i + 3).map((hex) => parseInt(hex, 16));
                          // 计算合并值，这里我们将三个值合并成一个 24 位的整数
                          let combinedValue = ((group[0] << 24) | (group[1] << 16) | (group[2] << 8)) / 255;
                          // let combinedValue = (group[0] << 16) | (group[1] << 8) | group[2];
                          combinedValue = (combinedValue * 2.5 * 1000) / (2 ** 23 - 1) / 6;
                          results.push(combinedValue);
                        }
                        const resultdata = Array.from({ length: 8 }, () => []);
                        // 遍历原数组，将元素按照索引分配到相应的数组中
                        results.forEach((item, index) => {
                          resultdata[index % 8].push(item);
                        });
                        //III
                        resultdata[8] = resultdata[2].map((value, index) => value - resultdata[1][index]);
                        //aVR
                        resultdata[9] = resultdata[1].map((value, index) => -(value + resultdata[2][index]) / 2);
                        //aVL
                        resultdata[10] = resultdata[1].map((value, index) => (value - resultdata[2][index]) / 2);
                        //aVF
                        resultdata[11] = resultdata[2].map((value, index) => (value - resultdata[1][index]) / 2);
                        zhi = false;
                      } else {
                        data = that.formatString(that.ab2hex(res.value));
                        zhi = true;
                      }
                    } else if (res.deviceId == 'F4:C3:5D:84:99:41') {
                      const data = new Uint8Array(res.value);
                      console.log('解析后的字节数组：', data);
                    }
                  });
                },
                fail: (res) => {
                  console.log('启用 notify 功能失败', res);
                  uni.hideLoading();
                  uni.showToast({ title: '连接失败', icon: 'none' });
                }
              });
            });
          }, 1500);
        }
      });
    },
    //初始化蓝牙
    initBle() {
      this.bleDevs = [];
      this.deviceIds = [];
      uni.openBluetoothAdapter({
        success: (res) => {
          uni.getBluetoothAdapterState({
            success: (res1) => {
              this.startBluetoothDeviceDiscovery();
            },
            fail(error) {
              uni.showToast({ icon: 'none', title: '查看手机蓝牙是否打开' });
            }
          });
        },
        fail: (err) => {
          //未打开
          uni.showToast({ icon: 'none', title: '查看手机蓝牙是否打开' });
        }
      });
    },
    // 开始搜索蓝牙设备
    startBluetoothDeviceDiscovery() {
      let th = this;
      if (th.sousuo) {
        this.stopBluetoothDevicesDiscovery(); // 停止搜索蓝牙
      }
      uni.startBluetoothDevicesDiscovery({
        success: (res) => {
          th.sousuo = true;
          this.onBluetoothDeviceFound();
        },
        fail: (err) => {
          console.log(err, '错误信息1');
        }
      });
    },
    // 发现外围设备
    onBluetoothDeviceFound() {
      uni.onBluetoothDeviceFound((res) => {
        if (this.bleDevs.indexOf(res.devices[0]) == -1) {
          if (res.devices[0].name.startsWith('ZKMC') || res.devices[0].name.startsWith('MP')) {
            this.bleDevs.push(res.devices[0]);
          }
        }
      });
    },

    // 多选然后连接
    connectBle() {
      if (this.deviceIds.length == 0) {
        uni.showToast({ title: '请选择连接的设备', icon: 'none' });
        return;
      }
      this.getData = [];
      this.deviceIds.forEach((item) => {
        this.nowLinkLis(item);
      });
    },

    // 停止搜寻蓝牙设备
    stopBluetoothDevicesDiscovery() {
      uni.stopBluetoothDevicesDiscovery({
        success: (e) => {
          this.sousuo = false;
          this.loading = false;
          // console.log("停止搜索蓝牙设备:" + e.errMsg);
        },
        fail: (e) => {
          console.log('停止搜索蓝牙设备失败，错误码：' + e.errCode);
        }
      });
    },

    close() {
      let that = this;
      uni.showModal({
        title: '提示',
        content: '将断开全部蓝牙连接',
        success: function (res) {
          if (res.confirm) {
            for (let index = 0; index < that.deviceIds.length; index++) {
              let item = that.deviceIds[index];
              uni.closeBLEConnection({
                deviceId: item.deviceId,
                success(res) {
                  console.log('断开蓝牙成功', res);
                  that.shows = false;
                  that.totalList = [];
                  uni.showToast({
                    title: '断开蓝牙成功'
                  });
                },
                fail(res) {
                  console.log('断开蓝牙失败', res);
                }
              });
            }
          }
        }
      });
    },

    // 直接启用监听功能
    nowLinkLis(items) {
      let that = this;
      let zhi = false;
      let data = '';
      console.log('items', items);
      uni.showLoading({
        title: '连接中，请稍等',
        mask: true
      });
      //连接蓝牙
      uni.createBLEConnection({
        deviceId: items.deviceId,
        success(res) {
          that.stopBluetoothDevicesDiscovery(); // 停止搜索蓝牙
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
  }
};
</script>
<style lang="scss" scoped>
.input3 {
  display: flex;
  justify-content: space-around;
  input {
    border: 1rpx solid #ccc;
    margin: 20rpx;
    text-align: center;
    height: 60rpx;
    border-radius: 10rpx;
    font-size: 50rpx;
  }
  input:first-child,
  input:last-child {
    width: 200rpx;
  }
}
.bakBlue {
  background-color: #007aff !important;
}
.appItems {
  padding: 30rpx 0 30rpx 4rpx;
  display: flex;
  flex-wrap: wrap;
  .item {
    color: #333;
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    border: 1rpx solid #ececec;
    margin: 10rpx 15rpx;
    position: relative;
    .txt {
      position: absolute;
      font-size: 26rpx;
      top: 56rpx;
      width: 100%;
      color: #fff;
      z-index: 10;
      text-align: center;
    }
    .name {
      position: absolute;
      width: 80%;
      left: 10%;
      bottom: 30rpx;
      font-size: 20rpx;
      text-align: center;
    }
  }
}
.timers {
  text-align: center;
  margin-top: 30rpx;
  .time {
    margin-bottom: 40rpx;
    width: 100%;
    font-size: 80rpx;
    font-weight: bold;
  }
  .btns {
    display: flex;
    justify-content: space-around;
    view {
      width: 200rpx;
      height: 60rpx;
      background-color: #007aff;
      color: #fff;
      line-height: 60rpx;
      border-radius: 10rpx;
    }
    view:active {
      background-color: #2990ff;
    }
  }
}
.items {
  width: 100%;
  font-size: 32rpx;
  overflow-y: scroll;
  height: 300rpx;
  background-color: #ccc;
  margin: 40rpx 0;
  .item {
    padding: 4rpx 20rpx 0 20rpx;
  }
}
.pl {
  margin: 20rpx;
  background-color: #007aff;
  padding: 10rpx;
}
.classText {
  width: 94%;
  padding: 10rpx;
  margin: 3%;
  border: 1rpx solid #ececec;
}
.send {
  background-color: #ff3e3e;
  color: #fff;
}
.dis {
  display: flex;
  justify-content: space-between;
  color: #fff;
  text-align: center;
  flex-wrap: wrap;
  view {
    width: 100%;
    border-radius: 8rpx;
    font-size: 32rpx;
  }
}
.barItems {
  width: 100%;
  .barItem {
    display: flex;
    justify-content: space-around;
    // border: 1rpx solid #ececec;
    height: 100rpx;
    padding-top: 20rpx;
    align-items: center;
    .bar {
      width: 300rpx;
      display: flex;
      justify-content: space-around;
      view {
        border: 1rpx solid #ececec;
        width: 50rpx;
        height: 50rpx;
        text-align: center;
      }
      input {
        width: 100rpx;
        text-align: center;
      }
    }
  }
}
</style>
<style>
page {
  background-color: #fff;
}
</style>
