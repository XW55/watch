<template>
  <view class="content">
    <button @click="init">初始化</button>
    <button @click="start">开始</button>
    <button @click="end">停止</button>
    <button @click="connect">连接</button>
    <view class="">设备列表: {{ listerData }}</view>
    <view class="">eegData: {{ eegData }}</view>
  </view>
</template>

<script>
// const muse = uni.requireNativePlugin('MuseManager');
const muse = uni.requireNativePlugin('Muse-Manager');

export default {
  data() {
    return {
      data: null,
      listerData: null,
      eegData: null
    };
  },
  onLoad() {
    plus.globalEvent.addEventListener('deviceList', (e) => {
      console.log('收到设备列表:', e);
      uni.showToast({ title: '发现设备' });
      this.listerData = JSON.stringify(e); // 转为字符串便于显示
    });

    plus.globalEvent.addEventListener('eegData', (e) => {
      console.log('收到脑波数据:', e);
      this.eegData = JSON.stringify(e);
    });
  },
  mounted() {},
  methods: {
    start() {
      // console.log('监听', plus.muse);
      muse.startListening((res) => {
        console.log('start的回调', res);
      });
    },
    end() {
      muse.stopListening((res) => {
        console.log('end的回调', res);
      });
    },
    connect() {
      muse.connect(JSON.stringify({ sn: '00:55:DA:BB:99:06' }), (res) => {
        console.log('connect的回调', res);
      });
    },
    init() {
      uni.getLocation({
        type: 'wgs84',
        success: () => {
          this.initBluetooth();
        },
        fail: () => {
          uni.showModal({ title: '提示', content: '请开启位置权限', showCancel: false });
        }
      });
    },
    initBluetooth() {
      uni.openBluetoothAdapter({
        success: () => {
          console.log(muse);
          muse.initMuse((res) => {
            console.log('initMuse 回调:', res);
            this.data = JSON.stringify(res);
          });
        },
        fail: () => {
          uni.showModal({ title: '提示', content: '请开启蓝牙', showCancel: false });
        }
      });
    }
  }
};
</script>
