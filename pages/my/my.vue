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
      修改个人信息
    </view>
    <view
      class=""
      @click="tiaozhuann"
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
  methods: {
    tiaozhuan() {
      if (!uni.getStorageSync('token')) {
        return uni.redirectTo({
          url: '/loginSign/pages/login/login'
        });
      }
      uni.redirectTo({
        url: '/loginSign/pages/modify/modify'
      });
    },
    tiaozhuann() {
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

<style lang="scss"></style>
