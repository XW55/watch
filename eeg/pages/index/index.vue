<template>
  <view class="content">
    <!-- 按钮部分保持不变 -->
    <button @click="init">1. 初始化</button>
    <button @click="start">2. 开始搜索脑电设备</button>
    <button @click="end">停止监听脑电设备</button>
    <button @click="disConnect">断开连接</button>
    <!-- <button @click="connect('00:55:DA:BB:99:06')">连接</button> -->
    <view class="">设备连接状态: {{ eegStatus }}</view>
    <view v-for="(items, index) in statusArr" :key="index">EEG通道 {{ index }}拟合值: {{ items.status }}</view>
    <view class="">设备列表</view>
    <view class="" v-for="(item, i) in listerData" :key="i" @click="connect(item.macAddress)">
      {{ item.name }}
    </view>

    <!-- 图表容器保持不变 -->
    <view style="width: 100%; height: 500rpx">
      <lechartt ref="accInstall" style="width: 100%; height: 100%"></lechartt>
    </view>
    <view style="width: 100%; height: 500rpx">
      <lechartt ref="eegInstall" style="width: 100%; height: 100%"></lechartt>
    </view>
    <view style="width: 100%; height: 500rpx">
      <lechartt ref="ppgInstall" style="width: 100%; height: 100%"></lechartt>
    </view>
    <!--    <view style="width: 100%; height: 500rpx">
      <lechartt ref="hsiPrecisionInstall" style="width: 100%; height: 100%"></lechartt>
    </view> -->

    <view style="width: 100%; height: 500rpx">
      <lechartt ref="gryoInstalls" style="width: 100%; height: 100%"></lechartt>
    </view>
  </view>
</template>

<script>
const muse = uni.requireNativePlugin('Muse-Manager');
import lechartt from '@/uni_modules/lime-echart/components/l-echart/l-echart.vue';
import * as echarts from '@/uni_modules/lime-echart/components/l-echart/echarts.min4.9.js';
import { getChartConfig } from './config.js';

// 图表颜色配置
const CHART_COLORS = {
  ACC: ['#1890FF', '#91CB74', '#FAC858'],
  EEG: ['#1890FF', '#91CB74', '#FAC858', '#FF3333'],
  PPG: ['#1890FF', '#91CB74', '#FAC858'],
  HSI: ['#1890FF', '#91CB74', '#FAC858', '#FF3333'],
  GYRO: ['#1890FF', '#91CB74', '#FAC858']
};

// 最大数据点数
const MAX_POINTS = 100;

export default {
  components: {
    lechartt
  },
  data() {
    return {
      sn: null,
      data: null,
      listerData: [],
      statusArr: [],
      eegData: null,
      eegStatus: null,
      lastCallTime: 0, // 上次调用时间戳
      latestVal: null, // 最新传入的数据,
      stateMap: ['未知', '已连接', '连接中', '已断开', '需要更新', '需要许可'],
      // 图表实例
      accInstall: null,
      eegInstall: null,
      ppgInstall: null,
      hsiPrecisionInstall: null,
      gryoInstalls: null,
      // 数据队列（存储数据点）
      accDataQueue: [[], [], []],
      eegDataQueue: [[], [], [], []],
      ppgDataQueue: [[], [], []],
      hsiDataQueue: [[], [], [], []],
      gyroDataQueue: [[], [], []],
      // 动画定时器
      animationTimer: null,
      // 最后更新时间戳
      lastUpdateTime: Date.now()
    };
  },
  onLoad() {
    plus.globalEvent.addEventListener('deviceList', (e) => {
      console.log('设备列表:', e);
      let data = typeof e === 'string' ? JSON.parse(e) : e;
      this.listerData.push(data);
    });

    plus.globalEvent.addEventListener('connectionState', (e) => {
      console.log('连接状态:', e);
      let data = typeof e === 'string' ? JSON.parse(e) : e;
      this.eegStatus = this.stateMap[data.CurrentConnectionState];
    });

    // 开始监听数据流
    this.startListening();
    // 启动动画循环
    this.startAnimationLoop();
  },
  onUnload() {
    // 组件卸载时停止动画循环
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
    }
  },
  mounted() {
    this.initChart();
  },
  methods: {
    updateStatus(val) {
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCallTime;

      // 如果还没到 2s，保存最新值，等待下一次执行
      if (timeSinceLastCall < 2000) {
        this.latestVal = val;
        return;
      }

      // 执行处理逻辑
      this.processUpdate(val);
      // 更新上次调用时间
      this.lastCallTime = now;
      // 清空暂存的最新值
      this.latestVal = null;

      // 设置定时器继续检查是否有新的 pending 数据
      this.throttleCheckPending();
    },
    processUpdate(val) {
      if (!Array.isArray(val)) {
        console.error('输入必须是一个数组');
        return;
      }

      const newStatus = val.map((item, index) => {
        const value = Number(item);

        let status;
        if (isNaN(value) || value < 0 || value > 4.5) {
          status = '未知状态';
        } else if (value < 1.5) {
          status = '良好';
        } else if (value < 2.5) {
          status = '中等';
        } else {
          status = '较差';
        }

        return { id: index, status };
      });

      // ✅ 使用 $set 确保响应式更新
      this.$set(this, 'statusArr', newStatus);
      console.log('节流更新:', newStatus);
    },
    throttleCheckPending() {
      setTimeout(() => {
        if (this.latestVal) {
          this.processUpdate(this.latestVal);
          this.lastCallTime = Date.now();
          this.latestVal = null;
        }
      }, 2000);
    },

    startAnimationLoop() {
      const update = () => {
        const now = Date.now();
        const elapsed = now - this.lastUpdateTime;

        // 控制更新频率在60FPS左右
        if (elapsed > 16) {
          this.updateAllCharts();
          this.lastUpdateTime = now;
        }

        // 继续循环
        this.animationTimer = setTimeout(update, 1);
      };

      this.animationTimer = setTimeout(update, 1);
    },

    updateAllCharts() {
      // 更新所有图表
      this.updateChart(this.accInstall, ['X', 'Y', 'Z'], this.accDataQueue, CHART_COLORS.ACC);
      this.updateChart(this.eegInstall, ['TP9', 'AF7', 'AF8', 'TP10'], this.eegDataQueue, CHART_COLORS.EEG);
      this.updateChart(this.ppgInstall, ['PPG1', 'PPG2', 'PPG3'], this.ppgDataQueue, CHART_COLORS.PPG);
      this.updateChart(this.hsiPrecisionInstall, ['HSI1', 'HSI2', 'HSI3', 'HSI4'], this.hsiDataQueue, CHART_COLORS.HSI);
      this.updateChart(this.gryoInstalls, ['GYRO_X', 'GYRO_Y', 'GYRO_Z'], this.gyroDataQueue, CHART_COLORS.GYRO);
    },

    startListening() {
      plus.globalEvent.addEventListener('eegData', (rawData) => {
        const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        const dataType = parsedData.dataType;
        const data = JSON.parse(parsedData.data);
        console.log('+++++++++++++++++++');
        console.log(dataType);
        console.log(data);
        // 根据数据类型添加到不同的缓冲队列
        switch (dataType) {
          case 'ACCELEROMETER':
            this.addToBuffer(this.accDataQueue, data);
            break;
          case 'EEG':
            this.addToBuffer(this.eegDataQueue, data);
            break;
          case 'GYRO':
            this.addToBuffer(this.gyroDataQueue, data);
            break;
          case 'HSI_PRECISION':
            // ✅ 正确使用防抖：传递函数引用而非调用结果
            this.updateStatus(data);

            // 使用$set确保响应式
            // this.$set(this, 'statusArr', hsiStatus);
            // this.addToBuffer(this.hsiDataQueue, data);
            break;
          case 'PPG':
            this.addToBuffer(this.ppgDataQueue, data);
            break;
          default:
            console.warn('未知数据类型:', dataType);
        }
      });
    },

    // 添加数据到缓冲队列
    addToBuffer(queue, newData) {
      for (let i = 0; i < newData.length; i++) {
        queue[i].push(newData[i]);
        // 限制队列长度
        if (queue[i].length > MAX_POINTS) {
          queue[i].shift();
        }
      }
    },

    // 更新图表
    updateChart(chartInstance, legendData, dataQueue, colors) {
      if (!chartInstance || dataQueue[0].length === 0) return;

      // 准备系列数据
      const series = legendData.map((name, index) => ({
        name,
        type: 'line',
        symbol: 'none',
        smooth: true,
        lineStyle: {
          width: 1
        },
        showSymbol: false,
        data: dataQueue[index],
        itemStyle: {
          color: colors[index] || '#1890FF'
        }
      }));

      // 更新图表
      chartInstance.setOption({
        series: series,
        xAxis: {
          data: Array(dataQueue[0].length).fill('')
        }
      });
    },

    // 初始化所有图表
    initChart() {
      this.initSingleChart('accInstall', '加速度计', ['X', 'Y', 'Z'], CHART_COLORS.ACC);
      this.initSingleChart('eegInstall', '脑电数据', ['TP9', 'AF7', 'AF8', 'TP10'], CHART_COLORS.EEG);
      this.initSingleChart('ppgInstall', '光电容积图', ['PPG1', 'PPG2', 'PPG3'], CHART_COLORS.PPG);
      // this.initSingleChart('hsiPrecisionInstall', '高精度心率', ['HSI1', 'HSI2', 'HSI3', 'HSI4'], CHART_COLORS.HSI);
      this.initSingleChart('gryoInstalls', '陀螺仪', ['GYRO_X', 'GYRO_Y', 'GYRO_Z'], CHART_COLORS.GYRO);
    },

    // 初始化单个图表
    initSingleChart(refName, title, legendData, colors) {
      this.$refs[refName].init(echarts, (chartInstance) => {
        this[refName] = chartInstance;

        // 使用导入的配置
        const config = getChartConfig({
          legendData: legendData,
          series: legendData.map((name, index) => ({
            name,
            type: 'line',
            symbol: 'none',
            smooth: true,
            data: [],
            itemStyle: {
              color: colors[index] || '#1890FF'
            }
          }))
        });

        // 添加标题
        config.title = {
          text: title,
          left: 'center',
          top: '5%',
          textStyle: {
            color: '#333',
            fontSize: 14
          }
        };

        // 设置图表配置
        chartInstance.setOption(config);
      });
    },

    // 以下方法保持不变
    disConnect() {
      muse.disconnect((res) => {
        console.log('disConnect的回调', res);
      });
    },
    start() {
      muse.startListening((res) => {
        console.log('start的回调', res);
      });
    },
    end() {
      muse.stopListening((res) => {
        console.log('end的回调', res);
      });
    },
    connect(sn) {
      this.end();
      console.log(JSON.stringify({ sn: sn }));
      muse.connect(JSON.stringify({ sn: sn }), (res) => {
        console.log('connect的回调', res);
      });
    },
    init() {
      uni.getLocation({
        type: 'wgs84',
        success: () => {
          this.initBluetooth();
        },
        fail: () => {
          uni.showModal({ title: '提示', content: '请开启位置权限', showCancel: false });
        }
      });
    },
    initBluetooth() {
      uni.openBluetoothAdapter({
        success: () => {
          console.log(muse);
          muse.initMuse((res) => {
            console.log('initMuse 回调:', res);
            // this.data = JSON.stringify(res);
            this.start();
          });
        },
        fail: () => {
          uni.showModal({ title: '提示', content: '请开启蓝牙', showCancel: false });
        }
      });
    }
  }
};
</script>
