<template>
  <view class="">
    <image
      class="img"
      :style="{ width: width + 'rpx', height: height + 'rpx' }"
      src="https://ecg.mindyard.cn/uploadPath/background/1.png"
      mode=""
    ></image>
    <view class="text" :style="{ color: textColor }">{{ text }}</view>
  </view>
</template>

<script>
export default {
  props: {
    width: {
      type: String,
      default: '500'
    },
    height: {
      type: String,
      default: '500'
    },
    text: {
      type: String,
      default: '暂无数据'
    },
    textColor: {
      type: String,
      default: '#00d6dc'
    }
  }
};
</script>

<style lang="scss" scoped>
.img {
  display: block;
  margin: 0 auto;
}
.text {
  display: block;
  text-align: center;
  font-size: 35rpx;
  margin-top: -60rpx;
}
</style>
