<template>
  <view class="content">
    <view class="top">
      <view class="xiao">
        <view class="iconfont icon-jiankangjiance-40px tubiao"></view>
        <view class="wenzi">{{ xindianble ? xindianble.name : '无心电设备连接' }}</view>
      </view>
      <view class="xiao">
        <view class="iconfont icon-yundongshoubiao tubiao"></view>
        <view class="wenzi">{{ pidianble ? pidianble.name : '无皮电设备连接' }}</view>
      </view>
    </view>
    <view class="loading" v-if="log && !(bleDevs.length > 0)">
      <view class="loader">
        <view class="orbe" style="--index: 0"></view>
        <view class="orbe" style="--index: 1"></view>
        <view class="orbe" style="--index: 2"></view>
        <view class="orbe" style="--index: 3"></view>
        <view class="orbe" style="--index: 4"></view>
      </view>
      <view class="" style="margin-top: 25rpx">正在搜索设备中...</view>
    </view>

    <view class="topwenzi" v-if="!log">
      <view class="">
        {{ bleDevs.length > 0 ? '我的设备' : '设备列表' }}
      </view>
    </view>
    <scroll-view scroll-y="true" show-scrollbar="true" class="contentzhi" v-if="!log">
      <view
        v-for="(item, index) in bleDevs"
        :key="index"
        v-if="item.name.length > 0 && !shows"
        style="padding: 10rpx 20rpx; border-bottom: 1rpx solid #ececec; display: flex; align-items: center"
      >
        <view style="font-size: 32rpx; color: #333">
          <checkbox-group @change="checkboxChange" :data-name="item.name" :data-deviceId="item.deviceId">
            <label>
              <checkbox :value="item.deviceId"></checkbox>
              <view class="">
                <view class="">
                  {{ item.name }}
                </view>
                <view style="font-size: 20rpx; padding: 10rpx 0">设备id: {{ item.deviceId }}</view>
              </view>
            </label>
          </checkbox-group>
        </view>
      </view>
      <view
        v-if="totalList.length > 0"
        v-for="(item, index) in totalList"
        :key="index"
        style="padding: 10rpx 20rpx; border-bottom: 1rpx solid #ececec; display: flex; align-items: center"
      >
        <view style="font-size: 32rpx; color: #333">
          <view class="">
            <view class="">
              {{ item.name }}
            </view>
            <view style="font-size: 20rpx; padding: 10rpx 0">设备id: {{ item.deviceId }}</view>
          </view>
        </view>
      </view>
      <view class="zhanwutupian" v-if="!bleDevs.length > 0 && !shows">
        <image src="/static/images/null.png" mode="heightFix"></image>
        <view class="">设备列表为空</view>
        <view class="">点击下方搜索设备按钮开始搜索</view>
      </view>
    </scroll-view>
    <view class="sousuo">
      <view :class="daojishi == 20 ? 'anniu' : 'huise'" v-show="!shows && !(deviceIds.length > 0)" @click="initBle">
        搜索 {{ daojishi == 20 ? '' : daojishi + 's' }}
      </view>
      <view @tap="connectBle" v-if="!shows && deviceIds.length > 0" class="anniu">连 接</view>
      <view @tap="close" v-if="shows" class="anniu">断 开</view>
    </view>
  </view>
</template>

<script>
import { initBlejs, nowLinkLisjs } from '@/utils/zongble.js';
import { mapState, mapMutations } from 'vuex';
export default {
  data() {
    return {
      daojishi: 20,
      daojishidengshiqi: null,
      log: false,
      // 搜索到的设备
      bleDevs: [],

      // getData: [],
      // 勾选上的设备
      deviceIds: [],
      // 全部已连接的设备
      totalList: [],

      shows: false,

      // timer: '',

      sousuo: false
    };
  },
  destroyed() {
    // clearInterval(this.timer);
  },
  computed: {
    ...mapState(['xindianble', 'pidianble'])
  },
  watch: {
    xindianble: {
      handler(newVal) {
        // this.setxindianble(newVal);
        // this.xindians = newVal;
      },
      deep: true
    },
    pidianble: {
      handler(newVal) {
        // this.setpidianble(newVal);
        // this.pidians = newVal;
      },
      deep: true
    }
  },
  onLoad() {},
  onShow() {
    // this.xindian = uni.getStorageSync('xindian');
    // console.log('心电设备');
    // console.log(this.xindian);
    if (this.xindianble) {
      this.totalList.push(this.xindianble);
      this.shows = true;
      this.log = false;
    }
    // this.pidian = uni.getStorageSync('pidian');
    // console.log('皮电设备');
    // console.log(this.pidian);
    if (this.pidianble) {
      this.totalList.push(this.pidianble);
      this.shows = true;
      this.log = false;
    }
  },
  mounted() {
    // this.onBLEConnectionStateChange();
  },
  methods: {
    ...mapMutations({
      setxindianble: 'SET_XINDIANBLE',
      setpidianble: 'SET_PIDIANBLE'
    }),
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
    onBLEConnectionStateChange() {
      uni.onBLEConnectionStateChange((res) => {
        // 该方法回调中可以用于处理连接意外断开等异常情况
        if (res.connected == false) {
          uni.hideLoading();
          for (let i = 0; i < this.totalList.length; i++) {
            if (res.deviceId == this.totalList[i].deviceId) {
              uni.showToast({
                title: this.totalList[i].name + ' 蓝牙设备断开连接',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    //初始化蓝牙
    initBle() {
      if (this.daojishi !== 20) return;
      if (this.daojishidengshiqi) {
        clearInterval(this.daojishidengshiqi);
      }
      this.daojishidengshiqi = setInterval(() => {
        this.daojishi--;
        if (this.daojishi == 0) {
          (this.log = false), clearInterval(this.daojishidengshiqi);
          (this.daojishidengshiqi = null), (this.daojishi = 20);
        }
      }, 1000);
      this.log = true;
      this.bleDevs = [];
      this.deviceIds = [];
      initBlejs((res) => {
        if (this.bleDevs.indexOf(res.devices[0]) == -1) {
          if (res.devices[0].name.startsWith('ZKMC') || res.devices[0].name.startsWith('MP')) {
            this.log = false;
            this.bleDevs.push(res.devices[0]);
          }
        }
      });
    },

    // 多选然后连接
    connectBle() {
      this.log = false;
      let th = this;
      if (this.deviceIds.length == 0) {
        uni.showToast({
          title: '请选择连接的设备',
          icon: 'none'
        });
        return;
      }
      // this.getData = [];
      this.deviceIds.forEach((item, index) => {
        setTimeout(() => {
          nowLinkLisjs(item, index, () => {
            th.shows = true;
            item.lianjie = true;
            th.totalList.push(item);
            console.log('连接设备存入本地');
            if (item.name.startsWith('ZKMC')) {
              th.setxindianble(item);
            } else if (item.name.startsWith('MP')) {
              th.setpidianble(item);
            }
            uni.showToast({
              title: '连接蓝牙成功'
            });
          });
        }, 800 * (index + 1));
      });
    },
    close() {
      let that = this;
      that.deviceIds = [];
      that.bleDevs = [];
      uni.showModal({
        title: '提示',
        content: '将断开全部蓝牙连接',
        success: function (res) {
          if (res.confirm) {
            for (let index = 0; index < that.totalList.length; index++) {
              let item = that.totalList[index];
              // console.log('//////////////////////////');
              // console.log(item);
              uni.closeBLEConnection({
                deviceId: item.deviceId,
                success(res) {
                  item.duankai = true;
                  console.log(that.totalList);
                  if (item.name.startsWith('MP')) {
                    that.setpidianble('');
                    console.log('皮电断开蓝牙成功', res);
                  } else if (item.name.startsWith('ZKMC')) {
                    that.setxindianble('');
                    console.log('心电断开蓝牙成功', res);
                  }
                  if (that.totalList.every((item) => item.duankai === true)) {
                    console.log('断开蓝牙成功', res);
                    that.totalList = [];
                    that.shows = false;
                    uni.showToast({
                      title: '断开蓝牙成功'
                    });
                  }
                },
                fail(res) {
                  console.log('断开蓝牙失败', res);
                }
              });
            }
          }
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.huise {
  background-color: #e6e6e8;
  color: #8c8f98;
}
.loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
<style lang="scss" scoped>
/* From Uiverse.io by krlozCJ */
.loader {
  --size-loader: 50px;
  --size-orbe: 10px;
  width: var(--size-loader);
  height: var(--size-loader);
  position: relative;
  transform: rotate(45deg);
}

.orbe {
  position: absolute;
  width: 100%;
  height: 100%;
  --delay: calc(var(--index) * 0.1s);
  animation: orbit7456 ease-in-out 1.5s var(--delay) infinite;
  opacity: calc(1 - calc(0.2 * var(--index)));
}

.orbe::after {
  position: absolute;
  content: '';
  top: 0;
  left: 0;
  width: var(--size-orbe);
  height: var(--size-orbe);
  background-color: #3ae374;
  box-shadow: 0px 0px 20px 2px #3ae374;
  border-radius: 50%;
}

@keyframes orbit7456 {
  0% {
  }

  80% {
    transform: rotate(360deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
<style lang="scss" scoped>
.top {
  width: 95%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.xiao {
  width: 40%;
  padding: 25rpx;
  text-align: center;
  .tubiao {
    font-size: 60rpx;
  }
  .wenzi {
    margin-top: 25rpx;
  }
}
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
  background-color: #ff6c00;
  color: #fff;
  padding: 10rpx 20rpx;
  border-radius: 25rpx;
  font-size: 30rpx;
  // letter-spacing: 3px;
  // box-sizing: border-box;
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
  height: 100%;
}

.content {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
<!-- 头部 -->
<style lang="scss" scoped>
.topwenzi {
  width: 93%;
  margin: 0 auto;
  font-size: 40rpx;
  font-weight: 600;
  padding: 40rpx 30rpx 30rpx 30rpx;
  display: flex;
  justify-content: space-between;
}
</style>
<!-- 中间 -->
<style scoped lang="scss">
.contentzhi {
  flex: 1;
  width: 93%;
  margin: 0 auto;
  // background-color: pink;
}

::v-deep .uni-label-pointer {
  display: flex;
  align-items: center;
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
</style>
<!-- 搜索按钮 -->
<style lang="scss" scoped>
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
  .huise {
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
    background-color: #e6e6e8;
    color: #8c8f98;
  }
}
</style>
