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
      12导检测
    </view>
    <view
      class=""
      @click="huatu"
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
      模拟12导联数据画图
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
      console.log('首页中本地中得ble设备');
      console.log(uni.getStorageSync('ble'));
      if (uni.getStorageSync('ble')) {
        uni.navigateTo({
          url: '/pageCheck/pages/new12/connect'
        });
      } else {
        uni.navigateTo({
          url: '/pageCheck/pages/search/search'
        });
      }
    },
    huatu() {
      uni.navigateTo({
        url: '/pageCheck/pages/ecgChart/ecgChart'
      });
    }
  }
};
</script>

<style lang="scss" scoped></style>
