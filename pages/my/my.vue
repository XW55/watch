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
    }
  }
};
</script>

<style lang="scss"></style>
