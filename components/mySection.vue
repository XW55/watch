<template>
  <view class="flex" :style="{ gap: gap + 'rpx', backgroundColor: bgColor, borderRadius: borderRadius + 'rpx' }">
    <view
      class="line"
      :style="{ backgroundColor: lineColor, height: height + 'rpx', lineHeight: height + 'rpx' }"
    ></view>
    <view class="text" :style="{ fontSize: fontSize + 'rpx' }">{{ title }}</view>
  </view>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: {
    borderRadius: {
      type: Number,
      default: 0
    },
    gap: {
      type: Number,
      default: 20
    },
    bgColor: {
      type: String,
      default: '#fff'
    },
    title: {
      type: String,
      default: ''
    },
    height: {
      type: Number,
      default: 40
    },
    lineColor: {
      type: String,
      default: '#09cc9d'
    },
    fontSize: {
      type: Number,
      default: 40
    }
  },
  watch: {
    styles(val) {
      console.log('接受的样式', val);
    }
  },
  created() {},
  mounted() {},
  methods: {}
};
</script>

<style lang="scss" scoped>
.flex {
  display: flex;
  align-items: center;
  justify-content: start !important;
  padding: 20rpx !important;
}
.line {
  width: 10rpx;
  border-radius: 10rpx;
}
</style>
