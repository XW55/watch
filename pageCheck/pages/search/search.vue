<template>
  <view style="display: flex; flex-direction: column; height: 100%">
    <view class="topwenzi">{{ yijingbleDevs.length > 0 ? '我的设备' : '设备列表' }}</view>

    <view class="contentzhi">
      <view class="shebeixiagn" v-if="!(yijingbleDevs.length > 0)" v-for="(item, index) in bleDevs" :key="index">
        <view class="">
          {{ item.name }}
        </view>
        <view @click="connectToDevice(item)" class="shebeianniu">连接</view>
      </view>
      <view class="shebeixiagn" v-eles v-for="(item, index) in yijingbleDevs" :key="index">
        <view>{{ item.name }}</view>
        <view class="shebeianniu" @click="close(item)">断开</view>
      </view>
      <view class="zhanwutupian" v-if="!yijingbleDevs.length > 0 && bleDevs.length == 0">
        <image src="/static/images/null.png" mode="heightFix"></image>
        <view class="">设备列表为空</view>
        <view class="">点击下方搜索设备按钮开始搜索</view>
      </view>
    </view>
    <view v-if="!yijingbleDevs.length > 0 && bleDevs.length == 0" class="sousuo">
      <view class="anniu" @click="searchBluetooth">搜索设备</view>
    </view>
    <u-notify ref="uNotify"></u-notify>
  </view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import {
  initBluetooth,
  startScanBluetooth,
  stopScanBluetooth,
  getDiscoveredDevices,
  connectToDevice,
  yilianjieshebei,
  shibaiyilianjieshebei,
  brokenLink,
  huidiaoDuankaiChenggong,
  huidiaoDuankaiShibai
} from '@/utils/new12ble';
export default {
  data() {
    return {
      tianjaishebei: null,
      // 搜索到的设备
      bleDevs: [],
      // 连接上有数据返回
      shows: false,
      // 已连接的设备
      yijingbleDevs: [],
      shebiezhi: false
    };
  },
  computed: {
    ...mapState({
      barUser: (state) => state.barUser,
      ble: (state) => state.ble
    })
  },
  onLoad() {
    this.shebiezhi = uni.getStorageSync('ble');
  },
  mounted() {
    shibaiyilianjieshebei((data) => {
      this.$refs.uNotify.show({
        top: 10,
        type: 'error',
        message: '连接设备失败,请更换设备连接',
        duration: 1000 * 1,
        fontSize: 20
      });
    });
    yilianjieshebei((data) => {
      if (data) {
        this.$refs.uNotify.show({
          top: 10,
          type: 'success',
          message: '连接设备成功',
          duration: 1000 * 1,
          fontSize: 20
        });
        this.shows = false;
        this.$set(this.yijingbleDevs, 0, data);
        this.setble(data);
      }
    });
    huidiaoDuankaiChenggong((data) => {
      this.$refs.uNotify.show({
        top: 10,
        type: 'success',
        message: '断开设备成功',
        duration: 1000 * 1,
        fontSize: 20
      });
    });
    huidiaoDuankaiShibai((data) => {
      this.$refs.uNotify.show({
        top: 10,
        type: 'error',
        message: '断开设备失败',
        duration: 1000 * 1,
        fontSize: 20
      });
    });
  },
  //离开当前页面
  onUnload() {
    console.log('卸载了');
    clearInterval(this.tianjaishebei);
    console.log('本地中得ble设备');
    console.log(uni.getStorageSync('ble'));
    // uni.closeBluetoothAdapter({
    //   success(res) {
    //     // uni.setStorageSync('blestate', false);
    //     console.log(`关闭蓝牙适配${res}`);
    //   }
    // });
  },
  methods: {
    ...mapMutations({
      setble: 'SET_BLE'
    }),
    // 初始化蓝牙适配器并搜索设备
    async searchBluetooth() {
      // if (!uni.getStorageSync('blestate')) {
      this.shows = true;
      this.updateDeviceList();
      await initBluetooth();
      await startScanBluetooth();
      // }
    },
    /**
        搜索到的蓝牙设备添加到bleDevs数组中，tianjaishebei定时器setInterval
        */
    updateDeviceList() {
      this.tianjaishebei = setInterval(() => {
        this.bleDevs = getDiscoveredDevices();
      }, 500);
    },
    // 连接设备
    async connectToDevice(device) {
      try {
        clearInterval(this.tianjaishebei);
        this.quxiaosousuo();
        await connectToDevice(device);
      } catch (err) {}
    },
    /**
    停止搜索蓝牙设备
    @param {type}
    */
    async quxiaosousuo() {
      this.shows = false;
      clearInterval(this.tianjaishebei);
      await stopScanBluetooth();
      // this.stopBluetoothDevicesDiscovery();
    },
    // 断开蓝牙连接
    close(item = this.yijingbleDevs[0]) {
      this.shows = false;
      this.bleDevs = [];
      this.setble(' ');
      if (item) {
        brokenLink(item);
      }

      this.yijingbleDevs = [];
    }
  }
};
</script>
<style>
page {
  background-color: #f8f8f8;
  height: 100%;
}
</style>
<style lang="scss" scoped>
.shebeixiagn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 25rpx;
  margin-bottom: 30rpx;
  .shebeianniu {
    background-color: #ff6c00;
    color: #fff;
    border-radius: 40rpx;
    padding: 10rpx 40rpx;
  }
}
.shebeixiagn:last-child {
  margin-bottom: 0;
}
.topwenzi {
  width: 93%;
  margin: 0 auto;
  font-size: 40rpx;
  font-weight: 600;
  padding: 40rpx 30rpx 30rpx 30rpx;
}
.contentzhi {
  flex: 1;
  width: 93%;
  margin: 0 auto;
  // background-color: pink;
}
.zhanwutupian {
  // padding-top: 50rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  image {
    margin-top: 80rpx;

    display: block;
    width: 100%;
  }
}
.sousuo {
  width: 100%;
  // margin: 0 auto;
  position: static;
  margin-bottom: 40rpx;
  // background-color: pink;
  .anniu {
    width: 93%;
    margin: 0 auto;
    background-color: #ff6c00;
    border-radius: 40rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 30rpx;
    padding: 20rpx 0;
  }
}
</style>
