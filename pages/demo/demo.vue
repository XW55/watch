<template>
  <view>
    <view
      class=""
      @click="tiaozhuan"
      style="
        width: 95%;
        margin: 0 auto;
        border-radius: 15rpx;
        background-color: #ff6c00;
        padding: 15rpx;
        color: #fff;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      退出登录
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {};
  },
  onLoad() {},
  methods: {
    tiaozhuan() {
      uni.closeBluetoothAdapter({
        success(res) {
          console.log(`关闭蓝牙适配${res}`);
        }
      });
      uni.clearStorageSync();
    }
  }
};
</script>