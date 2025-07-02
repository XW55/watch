<template>
  <view>
    <view class="top" @click="tiaozhuanlianjei">
      <view class="xiao">
        <view class="iconfont icon-jiankangjiance-40px tubiao"></view>
        <view class="wenzi">{{ xindianble ? xindianble.name : '无心电设备连接' }}</view>
      </view>
      <view class="xiao">
        <view class="iconfont icon-yundongshoubiao tubiao"></view>
        <view class="wenzi">{{ pidianble ? pidianble.name : '无皮电设备连接' }}</view>
      </view>
    </view>
    <view class="hreat-box">
      <view class="select-info" @click="tiaozhuan">
        <view class="select-info-title-tips">
          心电图
          <text class="select-info-title-tips">(II导联)</text>
        </view>
        <view class="select-info-btn">
          查看详情
          <u-icon name="arrow-right"></u-icon>
        </view>
      </view>
      <view class="info-cv">
        <view class="cvs-box">
          <canvas class="cvs" canvas-id="cvs-fig" id="cvs-fig"></canvas>
        </view>
      </view>
    </view>
    <view class="">
      <view class="" style="padding: 25rpx">
        <view
          class=""
          style="display: flex; justify-content: space-between; align-items: center; margin: 20rpx 40rpx"
          @click="tiapzhuanpidian"
        >
          <view class="select-info-title-tips">皮电</view>
          <view class="select-info-title-tips" style="display: flex; align-items: center">
            查看详情
            <u-icon name="arrow-right"></u-icon>
          </view>
        </view>
        <!--    <view style="width: 100%; height: 500rpx">
          <lechartt ref="chart"></lechartt>
        </view> -->
        <qiun-data-charts type="line" :opts="xyzOption" :chartData="chartData" />
      </view>
    </view>
    <view class="bottom">
      <view @click="kaishishagnchuan" v-if="xianshi" class="btnns edit-btn">开始上传数据</view>
      <view @click="jieshushagnchuan" v-else class="btnns edit-hui">结束上传数据</view>
    </view>
  </view>
</template>

<script>
import lechartt from '@/uni_modules/lime-echart/components/l-echart/l-echart.vue';
import * as echarts from '@/uni_modules/lime-echart/components/l-echart/echarts.min4.9.js';
import { mapState, mapMutations } from 'vuex';
import {
  setOnDataParseds,
  getqiehuan,
  setzhuyes,
  setfuyes,
  setkaishijieshou,
  shagnchuanshuju,
  xindianacc
} from '@/utils/zongble2.js';

import { setOnDataParsed, kaishipidianshangchuan } from '@/utils/config.js'; // 注意路径可能需要调整
import { DrawEcg } from '@/pageCheck/components/xindraw12.js';
import { xyzOption } from '@/utils/echartsOption.js';
import { updateEdaData } from '@/api/algorithm.js';
import { getCurrentTimeFormatted, GUID } from '@/utils/comm.js';
// let chartInstane = null;
export default {
  components: {
    lechartt
  },
  data() {
    return {
      xianshi: true,
      accIndex: 1, // 自增索引，用于模拟X轴标签
      xyzOption,
      chartData: {
        categories: [], // 时间戳作为X轴标签
        series: [
          { name: 'X', data: [] },
          { name: 'Y', data: [] },
          { name: 'Z', data: [] }
        ]
      },
      leftDistance: 320,
      pbm: '10rpx',
      ctxFig: null,
      cveObj: null,
      ecgType: 'DECG12SX',
      ecgShowLead: 'II',
      chartInstane: null
    };
  },
  watch: {
    xindianble: {
      handler(newVal) {
        // this.setxindianble(newVal);
      },
      deep: true
    },
    pidianble: {
      handler(newVal) {
        // this.setpidianble(newVal);
      },
      deep: true
    }
  },
  computed: {
    ...mapState(['xindianble', 'pidianble'])
  },
  onUnload() {
    setOnDataParsed(null, 1);
    // setOnDataParsed((type, data) => {
    //   this.updateChartData(data);
    // }, 1);
    // xindianacc(null, 1);
    // xindianacc((data) => {
    //   this.updateChartDatas(data);
    // }, 1);
  },
  onLoad(options) {
    let width = uni.getSystemInfoSync().windowWidth;
    this.leftDistance = (width / 750) * 320;
    this.leftDistance = Math.round(this.leftDistance);
    let info = uni.getSystemInfoSync();
    if (info.platform == 'android') {
      this.pbm = '40rpx';
    }
  },
  mounted() {
    // this.initChart();
    // II导联
    this.ctxFig = uni.createCanvasContext('cvs-fig');
    this.cveObj = new DrawEcg(this.ctxFig, 640, 328, this.ecgType, this.ecgShowLead);
  },
  onShow() {
    // this.xindian = uni.getStorageSync('xindian');
    // console.log('心电设备');
    // console.log(this.xindian);
    // this.pidian = uni.getStorageSync('pidian');
    // console.log('皮电设备');
    // console.log(this.pidian);
    setkaishijieshou(true);
    // 注册回调，接收解析后的数据
    setOnDataParsed((type, data) => {
      this.updateChartData(data);
    }, 1);
    // xindianacc((data) => {
    //   this.updateChartDatas(data);
    // }, 1);
    setzhuyes((data) => {
      if (data) {
        // console.log('画II导联');
        this.cveObj?.drawEcg(data);
      }
    }, 1);
  },
  methods: {
    ...mapMutations({
      setxindianble: 'SET_XINDIANBLE',
      setpidianble: 'SET_PIDIANBLE'
    }),
    initChart() {
      const initOption = {
        animation: true, // 开启动画
        animationDuration: 0, // duration: 0 关闭动画过渡
        // grid: {
        // width: '100%',
        // height: '80%',
        // containLabel: true
        // },
        // tooltip: {
        //   trigger: "axis",
        // },
        // legend: {
        //   left: 20,
        //   top: "15%",
        //   icon: "circle",
        // },
        color: ['#1890FF', '#91CB74', '#FAC858'], // 主题色
        legend: {
          data: ['X', 'Y', 'Z']
        },
        xAxis: {
          type: 'time' // 类别轴，适用于字符串类的 X 轴数据
          // data: [], // 初始为空数组，后续动态传
          // splitLine: {
          //   show: false,
          //   lineStyle: {
          //     //坐标轴以及刻度线颜色
          //     color: '#ccc'
          //   }
          // }, // 不显示网格线
          // axisLine: {
          //   lineStyle: {
          //     //坐标轴以及刻度线颜色
          //     color: '#ccc'
          //   }
          // },
          // axisLabel: {
          //   show: false
          // },
          // axisTick: {
          //   show: false
          // },
          // boundaryGap: false
        },
        yAxis: {
          axisLine: {
            show: true,
            lineStyle: {
              //坐标轴以及刻度线颜色
              color: '#ccc'
            }
          },
          type: 'value',
          splitLine: {
            lineStyle: {
              type: 'dashed', // 网格线为虚线
              width: 2, // 线宽为 2px
              color: '#ccc' // 线条颜色为灰色
            }
          },
          splitNumber: 5,
          axisLabel: {
            formatter: (value) => value.toFixed(0) // 格式化显示为小数点后三位
          }
        },
        series: [
          {
            name: 'X',
            data: [],
            type: 'line',
            symbol: 'none',
            smooth: true,
            showSymbol: false,
            lineStyle: { width: 2 },
            color: '#1890FF'
          },
          {
            name: 'Y',
            data: [],
            type: 'line',
            symbol: 'none',
            smooth: true,
            showSymbol: false,
            lineStyle: { width: 2 },
            color: '#91CB74'
          },
          { name: 'Z', data: [], type: 'line', symbol: 'none', smooth: true, color: '#FAC858' }
        ]
      };
      this.$refs.chart.init(echarts, (chartInstance) => {
        this.chartInstane = chartInstance;
        this.chartInstane.setOption(initOption);
      });
    },
    kaishishagnchuan() {
      console.log('开始上传');
      this.xianshi = !this.xianshi;
      kaishipidianshangchuan(true);
      shagnchuanshuju(true);
    },
    jieshushagnchuan() {
      this.xianshi = !this.xianshi;
      kaishipidianshangchuan(false);
      shagnchuanshuju(false);
      console.log('结束上传');
    },
    tiaozhuanlianjei() {
      if (!uni.getStorageSync('token')) {
        return uni.redirectTo({
          url: '/loginSign/pages/login/login'
        });
      }
      uni.navigateTo({
        url: '/pageCheck/pages/lianjie/lianjie'
      });
    },
    tiaozhuan() {
      if (!uni.getStorageSync('token')) {
        return uni.redirectTo({
          url: '/loginSign/pages/login/login'
        });
      }
      console.log('首页中本地中得xindian设备');
      console.log(uni.getStorageSync('xindian'));
      if (uni.getStorageSync('xindian')) {
        uni.navigateTo({
          url: '/pageCheck/pages/new12/connect'
        });
      } else {
        uni.navigateTo({
          url: '/pageCheck/pages/lianjie/lianjie'
        });
      }
    },
    tiapzhuanpidian() {
      if (!uni.getStorageSync('token')) {
        return uni.redirectTo({
          url: '/loginSign/pages/login/login'
        });
      }
      console.log('首页中本地中得pidian设备');
      console.log(uni.getStorageSync('pidian'));
      if (uni.getStorageSync('pidian')) {
        uni.navigateTo({
          url: '/pageCheck/pages/pidian/pidian'
        });
      } else {
        uni.navigateTo({
          url: '/pageCheck/pages/lianjie/lianjie'
        });
      }
    },
    updateChartDatas(data) {
      // console.log(data);
      if (data.acc) {
        this.chartData.categories.push(++this.accIndex);
        this.chartData.series[0].data.push(...data.acc.x_g); // X轴
        this.chartData.series[1].data.push(...data.acc.y_g); // Y轴
        this.chartData.series[2].data.push(...data.acc.z_g); // Z轴
        if (this.chartData.categories.length > 50) {
          this.chartData.categories.shift();
          this.chartData.series.forEach((s) => s.data.shift());
        }
        // console.log(this.chartData.categories);
        // console.log(this.chartData.series[0]);
        // console.log(this.chartData.series[1]);
        // console.log(this.chartData.series[2]);
        this.chartInstane.setOption({
          xAxis: {
            data: this.chartData.categories
          },
          series: this.chartData.series
        });
      }

      if (this.accIndex >= 10) {
        this.accIndex = 1;
      }
    },
    updateChartData(data) {
      console.log(data);
      if (data.acc) {
        this.chartData.categories.push(++this.accIndex);
        this.chartData.series[0].data.push(data.acc.x); // X轴
        this.chartData.series[1].data.push(data.acc.y); // Y轴
        this.chartData.series[2].data.push(data.acc.z); // Z轴
        if (this.chartData.categories.length > 50) {
          this.chartData.categories.shift();
          this.chartData.series.forEach((s) => s.data.shift());
        }
        // console.log(this.chartData.categories);
        // console.log(this.chartData.series[0]);
        // console.log(this.chartData.series[1]);
        // console.log(this.chartData.series[2]);
        this.chartInstane.setOption({
          // xAxis: {
          //   data: this.chartData.categories
          // },
          series: this.chartData.series
        });
      }

      if (this.accIndex >= 10) {
        this.accIndex = 1;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.bottom {
  width: 85%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
.btnns {
  text-align: center;
  padding: 30rpx 32rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  /* font-weight: bold; */
  color: white;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  // border: 1px solid #4caf50;
}
.edit-btn {
  background-color: #09cc9d;
}
.edit-hui {
  background-color: #f0f8ff;
  color: #000;
}
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
//II导联CANCAS画图
.hreat-box {
  width: 690rpx;
  // height: 544rpx;

  padding-top: 40rpx;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 14rpx;
  position: relative;
}
.select-info {
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  overflow: hidden;

  &-btn {
    font-size: 26rpx;
    line-height: 22rpx;
    color: #cdcdcd;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
.select-info-title-tips {
  font-size: 24rpx;
  color: #666;
}
.info-cv {
  // height: 416rpx;
  width: 640rpx;
  margin-left: 24rpx;
  background-color: #f8f8f8;
  margin-top: 24rpx;
  border-radius: 14rpx;
  overflow: hidden;
  padding-top: 12rpx;
}
.cvs-box {
  display: flex;
  width: 640rpx;
  align-items: center;
  justify-content: center;
  height: 328rpx;
  overflow: hidden;
  white-space: nowrap;
}
.cvs {
  box-sizing: border-box;
  display: inline-block;
  width: 640rpx;
  height: 328rpx;
}
</style>
