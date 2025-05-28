<template>
  <view class="page">
    <u-loading-page :loading="loading"></u-loading-page>
    <view class="content">
      <u-parse :content="content" class="parsefuwenben"></u-parse>
    </view>
  </view>
</template>

<script>
import { getPrivacy } from '@/api/loginSign/index.js';
export default {
  data() {
    return {
      title: '',
      content: '',
      loading: false
    };
  },
  onLoad(option) {
    this.title = option.title;
    this.getContent();
  },
  onReady() {
    uni.setNavigationBarTitle({
      title: this.title
    });
  },
  methods: {
    // 获取ECG
    getContent() {
      this.loading = true;
      getPrivacy({
        name: this.title
      })
        .then((res) => {
          if (res.data.code == 200) {
            if (res.data.data) {
              this.content = res.data.data.text;
            }
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<!-- 富文本 -->
<style scoped lang="scss">
.content {
  padding: 20rpx;
  // background-color: #dcfff2;
}
.parsefuwenben {
  ::v-deep .img {
    height: 250px !important;
  }
  ::v-deep .p {
    text-indent: 2em;
    // line-height: 1.5em;
  }
}
</style>
