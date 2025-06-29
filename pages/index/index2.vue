<template>
  <view class="zhuti">
    <view class="top" @click="tiaozhuanlianjei">
      <view class="xiao">
        <view class="iconfont icon-jiankangjiance-40px tubiao"></view>
        <view class="wenzi">{{ xindianble ? xindianble.name : '无心电设备' }}</view>
      </view>
      <view class="xiao">
        <view class="iconfont icon-naodian tubiao"></view>
        <view class="wenzi">{{ false ? xindianble.name : '无脑电设备' }}</view>
      </view>
      <view class="xiao">
        <view class="iconfont icon-yundongshoubiao tubiao"></view>
        <view class="wenzi">{{ pidianble ? pidianble.name : '无皮电设备' }}</view>
      </view>
    </view>
     <view class="tianxiexinxi" @click="tiaozhuanhuatu">跳转画图页面</view>
    <view class="tianxiexinxi" @click="tianxiexinxi">填写信息</view>
    <u-button class="" style="margin: 10px 0; text-align: center" @click="sendEcgCommands(1, 86400)">
      发送24小时检测指令
    </u-button>
    <u-button class="" style="margin: 10px 0; text-align: center" @click="sendEcgCommands(1, 30)">
      发送30s检测指令
    </u-button>
    <u-button class="" style="margin: 10px 0; text-align: center" @click="sendEcgCommands(2, 30)">
      停止检测
    </u-button>
    <u-button class="" style="margin: 10px 0; text-align: center" @click="onacc">开启加速度检测</u-button>
    <u-button class="" style="margin: 10px 0; text-align: center" @click="offacc">关闭加速度检测</u-button>
       <view style="width: 100%; height: 500rpx">
      <lechartt ref="chart"></lechartt>
    </view>
  <!--  <view class="search boxShadow">
      <input type="text" placeholder="输入手机号或姓名" class="search-input" v-model="searchPhone" maxlength="11" />
      <view class="search-btn" @click="searchThis"><u-icon name="search" size="30"></u-icon></view>
    </view>
    <view style="position: relative">
        <scroll-view
          class="detectListContent"
          scroll-y
          :style="{ height: scrollHeight + 'px' }"
          @scrolltolower="getNewList()"
          >
          <view class="tabs">
            <view class="tab" v-if="detectList.length > 0">
              <view
                class="list boxShadow"
                v-for="(item, index) in detectList"
                :key="index"
              >
                <view hover-class="none">
                  <view class="patientInfo">
                    <view class="info">
                      <view class="text">姓名:{{ item.patientName }}</view>
                      <view class="text">电话:{{ item.patientPhone }}</view>
                    </view>
                  </view>
                  <view style="width: 85%">
                    <view class="time">{{ item.connectionTime }}</view>
                    <view class="font">{{ item.intelligentDiagnosis }}</view>
                  </view>
                </view>
              </view>
            </view>
            <MyEmpty v-else text="当前没有检测数据"></MyEmpty>
          </view>
        </scroll-view>
      </view> -->
    </view>
  </view>
</template>

<script>
  import lechartt from '@/uni_modules/lime-echart/components/l-echart/l-echart.vue';
  import * as echarts from '@/uni_modules/lime-echart/components/l-echart/echarts.min4.9.js';
  import { wugandenglu } from '@/api/loginSign/index.js';
  import MyEmpty from '@/components/myEmpty.vue';
import { mapState, mapMutations } from 'vuex';

import { xindianacc } from '@/utils/zongble2.js';
export default {
  data() {
    return {
      searchPhone: '',
      scrollHeight: 0,
      detectList: [],
      total: 0,
      pageNum: 1,
       searchState: false,
        chartInstane: null,
             chartDataLength: 0
    };
  },
  computed: {
    ...mapState(['xindianble', 'pidianble'])
  },
  components: {
    MyEmpty,
    lechartt
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
  onShow(){
     uni.hideLoading();
    this.wugandengluapps();
  },
  mounted(){
     this.initChart();
         this.getbleshuju(); // 开始获取数据
  },
  onReady() {
    let th = this;
    uni.getSystemInfo({
      success: function (res) {
        const query = uni.createSelectorQuery();
        query.select('.detectListContent').boundingClientRect();
        query.exec(function (res2) {
          th.scrollHeight = res.windowHeight - res2[0].top;
        });
      }
    });
  },
  methods: {
// 父组件中的getbleshuju方法
    getbleshuju() {
      xindianacc((res) => {
     const xData = res.x
     const yData = res.y
     const zData = res.z
   
     let index = 0;
     const total = xData.length;
   
     const timer = setInterval(() => {
       if (index < total) {
         this.addDataPoint(xData[index], yData[index], zData[index]);
         index++;
       } else {
         clearInterval(timer);
       }
     }, 16); // 每 16ms 显示一个点（≈60FPS）
      })
    },
    
addDataPoint(xVal, yVal, zVal) {
    const chart = this.chartInstane;
    const maxLength = 20; // 固定长度为20

    // 获取当前系列数据，并添加新值
    let series = chart.getOption().series;
    for (let i = 0; i < series.length; i++) {
        if (i === 0) { // X轴数据
            series[i].data.push(xVal);
        } else if (i === 1) { // Y轴数据
            series[i].data.push(yVal);
        } else { // Z轴数据
            series[i].data.push(zVal);
        }
        // 限制数据长度
        if (series[i].data.length > maxLength) {
            series[i].data.shift();
        }
    }

    // 更新图表选项
    chart.setOption({
        series: series,
        xAxis: {
            data: Array.from({ length: maxLength }, (_, i) => ''), // 不显示X轴标签
        },
    });
},
initChart() {
    const initOption = {
        color: ['#1890FF', '#91CB74', '#FAC858'], // 主题色
        legend: {
            data: ['X', 'Y', 'Z']
        },
        xAxis: {
            type: 'category',
            axisLabel: {
                show: false // 隐藏X轴标签
            }
        },
        grid: {
            top: '10%',
            // containLabel: true
        },
        yAxis: {
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#ccc'
                }
            },
            type: 'value',
            splitLine: {
                lineStyle: {
                    type: 'solid', // 网格线为实线
                    width: 0.5, // 线宽为 0.5px
                    color: '#ccc' // 线条颜色为灰色
                }
            },
        },
        series: [
            {
                name: 'X',
                data: [],
                type: 'line',
                symbol: 'none',
                smooth: true,
                showSymbol: false,
                lineStyle: { width: 1 },
                color: '#1890FF'
            },
            {
                name: 'Y',
                data: [],
                type: 'line',
                symbol: 'none',
                smooth: true,
                showSymbol: false,
                lineStyle: { width: 1 },
                color: '#91CB74'
            },
            { 
                name: 'Z', 
                data: [], 
                type: 'line', 
                symbol: 'none', 
                smooth: true, 
               lineStyle: { width: 1 },
                color: '#FAC858',
            }
        ]
    };
    this.$refs.chart.init(echarts, (chartInstance) => {
        this.chartInstane = chartInstance;
        this.chartInstane.setOption(initOption);
    });
},
// 发送ECG控制指令（动态心电记录仪，兼容启动/停止）
    sendEcgCommands(control, seconds) {
      // 参数校验：控制位合法性及时间范围（停止时时间参数无效，设为0）
      if (!this.xindianble) {
        uni.navigateTo({ url: '/pages/lianjie/lianjie' });
        return;
      }
      if (control !== 1 && control !== 2) {
        console.error('错误：控制位必须为1（启动）或2（停止）');
        return;
      }
      if (control === 1 && (seconds < 30 || seconds > 86400)) {
        console.error('错误：启动时测量时间必须在30-86400秒之间');
        return;
      }
    
      let th = this;
      // 构建Data区：控制位[1] + 测量时间[3字节]（停止时时间设为0）
      const data = new Uint8Array(4);
      data[0] = control; // 控制位（1=启动，2=停止）
    
      // 启动时设置时间，停止时时间设为0（协议中停止指令无需时间参数）
      if (control === 1) {
        data[1] = seconds & 0xff; // 启动时间低字节
        data[2] = (seconds >> 8) & 0xff; // 启动时间中字节
        data[3] = (seconds >> 16) & 0xff; // 启动时间高字节
      } else {
        data[1] = 0;
        data[2] = 0;
        data[3] = 0; // 停止时时间设为0
      }
    
      // 计算Length字段（Data区固定4字节，小端模式）
      const length = data.length;
      const lengthLow = length & 0xff; // 0x04
      const lengthHigh = (length >> 8) & 0xff; // 0x00
    
      // 计算CheckSum（Data区累加和，小端模式）
      let checkSum = 0;
      for (let byte of data) checkSum += byte;
      const checkSumLow = checkSum & 0xff;
      const checkSumHigh = (checkSum >> 8) & 0xff;
    
      // 构建完整指令包（总长度10字节）
      const packet = new Uint8Array([
        0xbc, // Magic Byte
        0x30, // ECG_CTRL指令
        lengthLow, // Length低字节
        lengthHigh, // Length高字节
        checkSumLow, // CheckSum低字节
        checkSumHigh, // CheckSum高字节
        data[0], // 控制位
        data[1], // 时间低字节
        data[2], // 时间中字节
        data[3] // 时间高字节
      ]);
    
      // 日志输出指令包
      const action = control === 1 ? '启动' : '停止';
      const timeDesc = control === 1 ? `${seconds}秒` : '检测';
      console.log(`\n=== ECG ${action}指令包（${timeDesc}）===`);
      const hexStr = Array.from(packet)
        .map((b) => `0x${b.toString(16).padStart(2, '0')}`)
        .join(' ');
      const decStr = Array.from(packet).join(', ');
      console.log(`HEX: ${hexStr}`);
      console.log(`DEC: ${decStr}`);
    
      // 发送指令
      uni.writeBLECharacteristicValue({
        deviceId: this.xindianble.deviceId,
        serviceId: 'DE5BF728-D711-4E47-AF26-65E3012A5DC7',
        characteristicId: 'DE5BF72A-D711-4E47-AF26-65E3012A5DC7',
        value: packet.buffer,
        success: () => {
          console.log(`${action}检测指令发送成功`);
          if(control == 1){
            uni.navigateTo({
              url:'/ecg/pages/index/index'
            })
          }
        },
        fail: (e) => {
          console.error(`${action}检测失败:`, e)
        }
      });
    },
    onacc() {
      console.log(this.xindianble);
      if (!this.xindianble) {
        uni.navigateTo({
          url: '/pages/lianjie/lianjie'
        });
        return;
      }
      let th = this;
      const packet = new Uint8Array(7);
      packet[0] = 0xbc; // Magic Byte
      packet[1] = 0x33; // ECG_CTRL指令
      packet[2] = 0x01; // Length低字节（0x02）
      packet[3] = 0x00; // Length高字节（0x00）
      packet[4] = 0x01; // CheckSum低字节
      packet[5] = 0x00; // CheckSum高字节
      packet[6] = 0x01; // 控制位
      // 转换为ArrayBuffer
      const buffer = packet.buffer;
      // 发送指令
      uni.writeBLECharacteristicValue({
        deviceId: this.xindianble.deviceId,
        serviceId: 'DE5BF728-D711-4E47-AF26-65E3012A5DC7',
        characteristicId: 'DE5BF72A-D711-4E47-AF26-65E3012A5DC7',
        value: buffer,
        success: (red) => {
          console.log('指令发送成功');
          console.log(red);

        },
        fail: (e) => {
          console.error('发送失败:', e);
        }
      });
    },
    offacc() {
      if (!this.xindianble) {
        uni.navigateTo({
          url: '/pages/lianjie/lianjie'
        });
        return;
      }
      const packet = new Uint8Array(7);
      packet[0] = 0xbc; // Magic Byte
      packet[1] = 0x33; // ECG_CTRL指令
      packet[2] = 0x01; // Length低字节（0x02）
      packet[3] = 0x00; // Length高字节（0x00）
      packet[4] = 0x02; // CheckSum低字节
      packet[5] = 0x00; // CheckSum高字节
      packet[6] = 0x02; // 控制位
      // 转换为ArrayBuffer
      const buffer = packet.buffer;
      // 发送指令
      uni.writeBLECharacteristicValue({
        deviceId: this.xindianble.deviceId,
        serviceId: 'DE5BF728-D711-4E47-AF26-65E3012A5DC7',
        characteristicId: 'DE5BF72A-D711-4E47-AF26-65E3012A5DC7',
        value: buffer,
        success: (red) => {
          console.log('指令发送成功');
          console.log(red);
        },
        fail: (e) => {
          console.error('发送失败:', e);
        }
      });
    },
    wugandengluapps(){
      wugandenglu()
        .then((res) => {
          console.log(res);
          if (res.data.code == 200) {
            // uni.showToast({
            //   title: '登录成功',
            //   icon: 'none'
            // });
            let token = res.data.token;
            uni.setStorageSync('token', token);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getNewList() {
      if (this.detectList.length >= this.total && this.total != 0) {
        return;
      }
      console.log('界面触底了');
      this.pageNum = this.pageNum + 1;
  
    },
    searchThis() {
      console.log('搜索电话');
      console.log(this.searchPhone);
    },
    tiaozhuanlianjei() {
      uni.navigateTo({
        url: '/pageCheck/pages/lianjie/lianjie'
      });
    },
    tiaozhuanhuatu(){
      uni.navigateTo({
        url:'/ecg/pages/index/index'
      })
    },
    tianxiexinxi(){
      uni.navigateTo({
        url: '/pages/tianxiexinxi/tianxiexinxi'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.zhuti {
  width: 95%;
  margin: 0 auto;
}
.top {
  width: 100%;
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
.tianxiexinxi {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 25rpx;
  border-radius: 25rpx;
  color: #fff;
  background-color: #3699ec;
  box-sizing: border-box;
  margin: 25rpx 0;
}
.search {
  background-color: white;
  width: 100%;
  height: 90rpx;
  margin: 25rpx 0;
  display: flex;
  align-items: center;
  border-radius: 10rpx;

  &-input {
    width: 100%;
    height: 80rpx;
    border: none;
    outline: none;
    font-size: 30rpx;
    padding-left: 20rpx;
  }

  &-btn {
    width: 80rpx;
    text-align: center;
    font-size: 30rpx;
    color: #999999;
  }
}
.detectListContent {
    height: calc(100vh - 250rpx);
    overflow-y: scroll;

    .tabs {
      .list {
        background: #fff;
        border-radius: 15rpx;
        padding: 20rpx;
        margin: 15rpx 20rpx;
        position: relative;

        .status {
          position: absolute;
          right: 0;
          top: 0;
          padding: 10rpx 20rpx;
        }

        .patientInfo {
          image {
            width: 70rpx;
            height: 70rpx;
            vertical-align: text-bottom;
            display: inline-block;
          }

          .info {
            margin-left: 20rpx;
            display: inline-block;

            .text {
              font-size: 24rpx;
              color: #505050;
            }
          }
        }

        .font {
          font-size: 30rpx;
          color: #333333;
        }

        .time {
          margin-top: 10rpx;
          font-size: 24rpx;
          color: #999999;
        }
      }

      .zw {
        padding-top: 20%;

        image {
          width: 400rpx;
          height: 400rpx;
          display: block;
          margin: 0 auto;
        }

        text {
          font-size: 35rpx;
          color: #00d6dc;
          display: block;
          text-align: center;
        }
      }
    }
  }
</style>
