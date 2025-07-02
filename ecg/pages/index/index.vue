<template>
  <view class="container">
    <!-- ECG 组件 -->
    <ecg-grid
      ref="ecgGrid"
      :duration="duration"
      :speed="speed"
      :voltage-scale="voltageScale"
      :line-obj="lineObj"
      :container-height="ecgHeight"
    />
    <view style="width: 100%; height: 500rpx">
      <lechartt ref="eegInstall" style="width: 100%; height: 100%"></lechartt>
    </view>
    <qiun-data-charts type="line" :opts="gsrOption" :chartData="gsrData" />
    <view class="controls" v-if="false">
      <view class="control-group">
        <view class="control-title">心电图参数配置</view>

        <view class="slider-container">
          <view class="slider-label">
            <text>显示时长: {{ duration }}秒</text>
            <text class="highlight">大格数: {{ bigGridCount }}</text>
          </view>
          <slider
            :value="duration"
            min="1"
            max="6"
            step="1"
            @change="onDurationChange"
            activeColor="#8E2DE2"
            backgroundColor="#2c3e50"
            block-color="#8E2DE2"
            block-size="20"
          />
          <view class="value-display">每大格宽度(pigK): {{ pigK.toFixed(2) }}px</view>
        </view>

        <view class="slider-container">
          <view class="slider-label">
            <text>走纸速度: {{ speed }}mm/s</text>
            <text class="highlight">采样率: {{ sampleRate }}Hz</text>
          </view>
          <slider
            :value="speed"
            min="10"
            max="50"
            step="1"
            @change="onSpeedChange"
            activeColor="#8E2DE2"
            backgroundColor="#2c3e50"
            block-color="#8E2DE2"
            block-size="20"
          />
          <view class="value-display">小格宽度(smallK): {{ smallK.toFixed(2) }}px</view>
        </view>
      </view>

      <view class="control-group">
        <view class="control-title">电压灵敏度</view>
        <view class="slider-container">
          <view class="slider-label">
            <text>电压比例: {{ voltageScale }} mm/mV</text>
          </view>
          <slider
            :value="voltageScale"
            min="1"
            max="8"
            step="0.5"
            @change="onVoltageScaleChange"
            activeColor="#8E2DE2"
            backgroundColor="#2c3e50"
            block-color="#8E2DE2"
            block-size="20"
          />
          <view class="value-display">垂直比例: {{ ((voltageScale * pigK) / 5).toFixed(2) }}px/mV</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ECGEDAEEGData } from '@/api/algorithm.js';
import lechartt from '@/uni_modules/lime-echart/components/l-echart/l-echart.vue';
import * as echarts from '@/uni_modules/lime-echart/components/l-echart/echarts.min4.9.js';
import { getdata, xindianacc } from '@/utils/zongble2.js';
import EcgGrid from '../../components/ecgGrid.vue';
import { datas } from '@/utils/data.js';
import { getChartConfig } from './config.js';
import { mapState, mapMutations } from 'vuex';
import { setOnDataParsed, ppgValuesHistory, gsrValuesHistory } from '@/utils/config.js'; // 注意路径可能需要调整
import { getCurrentTimeFormatted, GUID } from '@/utils/comm.js';
// 导入BLEDataCollector类
import BLEDataCollector from '@/utils/BLEDataCollector.js';
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
let gsrUpload = [];
export default {
  components: {
    EcgGrid,
    lechartt
  },

  data() {
    return {
      eegInstall: null,
      duration: 3,
      speed: 25,
      voltageScale: 5,
      sampleRate: 120,
      ecgHeight: 400, // ECG 容器高度
      lineObj: {
        num: 1,
        text: ['II'],
        data: []
      },
      pigK: 0,
      lastDrawTime: 0,
      smallK: 0,
      dataIndex: 0,
      ecgDataBuffer: [], // 心电图数据缓冲区
      lastDrawTime: 0, // 上次绘制时间
      realTimeData: [], // 实时数据存储
      // 动画定时器
      animationTimer: null,
      // 最后更新时间戳
      lastUpdateTime: Date.now(),
      eegDataQueue: [[], [], [], []],
      // 皮电 -------------------------------
      accIndex: 1, // 自增索引，用于模拟X轴标签
      tempGsrData: [], // 临时存储
      gsrIndex: 0,
      isUpdating: false, // 标识是否正在更新
      gsrData: {
        categories: [],
        series: [{ name: '皮电', data: [] }]
      },
      gsrOption: {
        animation: false,
        update: true,
        duration: 0,
        color: ['#1890FF'],
        padding: [15, 10, 0, 0],
        dataLabel: false,
        dataPointShape: false,
        enableScroll: false,
        legend: {},
        xAxis: {
          disableGrid: true,
          disabled: true,
          data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        },
        yAxis: {
          gridType: 'dash',
          splitNumber: 4
          // data: [
          //   {
          //     min: 0,
          //     max: 5
          //   }
          // ]
        },
        extra: {
          line: {
            type: 'curve',
            width: 2,
            activeType: 'hollow',
            linearType: 'custom'
          }
        }
      },
      // 数据收集器实例
      bleCollector: null,
      shangchuan: null
    };
  },

  computed: {
    ...mapState(['xindianble', 'pidianble']),
    bigGridCount() {
      return this.duration / 0.2;
    }
  },
  onLoad() {
    // 创建BLEDataCollector实例
    this.bleCollector = new BLEDataCollector();
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
  mounted() {
    this.shangchuan = setTimeout(() => {
      let pId = GUID();
      this.startUploading(pId);
      clearTimeout(this.shangchuan);
      this.shangchuan = null;
    }, 5000);
    // 皮电
    // 注册回调，接收解析后的数据
    setOnDataParsed((type, data) => {
      this.bleCollector.handleDevice2Data(data);
      this.updateChartData(data);
    }, 2);
    this.initChart();
    this.ecgDataBuffer = []; // 数据缓冲区
    this.lastDrawTime = 0; // 上次绘制时间
    this.realTimeData = []; // 初始化实时数据
    this.fasongxindianzhiling(1, 86400);
    this.getbleshuju(); // 开始获取数据
    this.updateGridSizes();
    // 监听屏幕旋转
    uni.onWindowResize(() => {
      this.updateGridSizes();
    });
  },
  onShow() {
    this.getbleshuju(); // 开始获取数据
  },
  onUnload() {
    // 页面卸载时停止上传并清理资源
    this.stopUploading();
    this.bleCollector = null;
    if (this.shangchuan) {
      clearTimeout(this.shangchuan);
      this.shangchuan = null;
    }
  },
  methods: {
    /**
     * 开始上传数据
     */
    startUploading() {
      if (this.bleCollector) {
        this.bleCollector.startUploading();
      }
    },
    /**
     * 停止上传数据
     */
    stopUploading() {
      if (this.bleCollector) {
        this.bleCollector.stopUploading();
      }
    },
    // 心电数据
    getbleshuju() {
      let that = this;
      getdata((num = 1, text = ['II'], zhi) => {
        // 直接传递新数据（无需缓冲）
        that.lineObj = {
          num: num,
          text: text,
          data: [zhi] // 直接传递新数据数组
        };
        this.bleCollector.handleECGData(zhi);
      });
      xindianacc((res) => {
        const xData = res.x;
        const yData = res.y;
        const zData = res.z;
        const xData_g = res.x_g;
        const yData_g = res.y_g;
        const zData_g = res.z_g;
        this.bleCollector.handleECGAccData(res);
      });
    },

    // getbleshuju() {
    //   this.simulateRealTimeECG((num, text, zhi) => {
    //     this.lineObj = {
    //       num: num,
    //       text: text,
    //       data: [zhi]
    //     };
    //   });
    // },
    // 上传数据
    postdata() {
      // ECGEDAEEGData();
      const obj = {
        pId: GUID(),
        // 心电相关数据
        ecg_data: {
          I: [], //心电数据
          acc_x: [], //加速度x
          acc_y: [], //加速度y
          acc_z: [], //加速度z
          ang_x: [], //角速度x
          ang_y: [], //角速度y
          ang_z: [], //角速度z
          sample_rate: 100 //采样率
        },
        // 脑电相关数据
        eeg_data: {
          // 左前额
          FP1: [],
          // 右前额
          FP2: [],
          // 左耳
          T7: [],
          // 右耳
          T8: [],
          acc_x: [],
          acc_y: [],
          acc_z: [],
          ang_x: [],
          ang_y: [],
          ang_z: [],
          PPG: [
            // 通道1数据
            [],
            // 通道2数据
            [],
            // 通道3数据
            []
          ],
          HSI: [
            // 通道1数据
            [],
            // 通道2数据
            [],
            // 通道3数据
            []
          ],
          // 采样率
          sample_rate: 100
        },
        // 皮电相关数据
        eda_data: {
          // 皮电数据
          I: [], //10
          // 125
          ang_x: [],
          ang_y: [],
          ang_z: [],
          // 红光与红外光125
          red: [
            // 通道1数据
            [],
            // 通道2数据
            [],
            // 通道3数据
            [],
            // 通道4数据
            []
          ],
          // 红外光
          infrared: [
            // 通道1数据
            [],
            // 通道2数据
            [],
            // 通道3数据
            [],
            // 通道4数据
            []
          ],
          // 采样率
          sample_rate: 1
        },
        // 姓名
        patient_name: '',
        // 性别
        gender: '',
        // 年龄
        age: '',
        //  设备号
        deviceSN: '',
        // 电话
        patient_phone: '',
        // 数据类型
        data_type: 'TrioSignal'
      };
      console.log('上传的数据', obj);

      // 调用上传函数
      // updateEdaData(obj)
      //   .then((res) => {
      //     console.log(res);
      //     // 成功上传后，删除已上传的数据
      //     gsrUpload = gsrUpload.slice(100); // 删除前100个已上传的数据
      //   })
      //   .catch((err) => {
      //     console.error('上传失败:', err);

      //   });
    },
    // 皮电
    // 定时更新函数
    updateChartWithDelay() {
      if (this.tempGsrData.length > 0) {
        const value = this.tempGsrData.shift(); // 取出第一个元素
        this.gsrIndex++;
        this.gsrData.categories.push(this.gsrIndex);
        this.gsrData.series[0].data.push(value);

        // 控制最大点数
        const POINTS_TO_KEEP = 10;
        while (this.gsrData.categories.length > POINTS_TO_KEEP) {
          this.gsrData.categories.shift();
          this.gsrData.series[0].data.shift();
        }
        if (this.gsrIndex >= 50) {
          this.gsrIndex = 1;
        }

        // 设置下一个定时器
        setTimeout(() => this.updateChartWithDelay(), 100); // 每隔0.1秒更新一次
      } else {
        this.isUpdating = false; // 更新完成
      }
    },
    // 皮电数据data
    updateChartData(data) {
      // data.gsr皮电
      // data.acc加速度*3
      // data.red红光*4
      // data.infrared红外光*4
      // console.log(data);
      if (data.gsr && Array.isArray(data.gsr) && data.gsr.length > 0) {
        // 如果当前没有在更新，则开始更新
        if (!this.isUpdating) {
          this.isUpdating = true;
          this.tempGsrData = [...data.gsr]; // 将新数据存入临时存储
          this.updateChartWithDelay(); // 开始第一次更新
        } else {
          // 如果已经在更新，则将新数据追加到临时存储中
          this.tempGsrData = this.tempGsrData.concat(data.gsr);
        }
      }
      if (this.accIndex >= 10) {
        this.accIndex = 1;
      }
    },
    // ---------------------------------
    // 初始化所有图表
    initChart() {
      this.initSingleChart('eegInstall', '脑电数据', ['TP9', 'AF7', 'AF8', 'TP10'], CHART_COLORS.EEG);
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
    // 脑电数据
    startListening() {
      plus.globalEvent.addEventListener('eegData', (rawData) => {
        this.bleCollector.handleDevice3Data(rawData);
        const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        const dataType = parsedData.dataType;
        const data = JSON.parse(parsedData.data);
        // console.log('+++++++++++++++++++');
        // console.log(dataType);
        // console.log(data);
        // 根据数据类型添加到不同的缓冲队列
        switch (dataType) {
          case 'ACCELEROMETER':
            // this.addToBuffer(this.accDataQueue, data);
            break;
          case 'EEG':
            this.addToBuffer(this.eegDataQueue, data);
            break;
          case 'GYRO':
            // this.addToBuffer(this.gyroDataQueue, data);
            break;
          case 'HSI_PRECISION':
            // ✅ 正确使用防抖：传递函数引用而非调用结果
            // this.updateStatus(data);

            // 使用$set确保响应式
            // this.$set(this, 'statusArr', hsiStatus);
            // this.addToBuffer(this.hsiDataQueue, data);
            break;
          case 'PPG':
            // this.addToBuffer(this.ppgDataQueue, data);
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
      this.updateChart(this.eegInstall, ['TP9', 'AF7', 'AF8', 'TP10'], this.eegDataQueue, CHART_COLORS.EEG);
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
    fasongxindianzhiling(control, seconds) {
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
          th.gotoEcg && th.gotoEcg();
        },
        fail: (e) => console.error(`${action}检测失败:`, e)
      });
    },

    generateECGSample(index) {
      // 模拟一个基本的 ECG 波形（简化版）
      const t = index / 120; // 时间（秒）

      // 主频约 1Hz 的正弦波（模拟心跳周期）
      let ecg = Math.sin(2 * Math.PI * 1 * t);

      // 添加 QRS 波群：短时间高频尖峰
      const beatInterval = 1.0; // 心跳间隔（秒）
      const qrsWidth = 0.05; // QRS 波宽度（秒）
      const timeInCycle = t % beatInterval;

      if (timeInCycle < qrsWidth) {
        // 模拟 QRS 波（用指数衰减脉冲模拟）
        const spike = Math.exp(-50 * (timeInCycle - 0.02)) * 2;
        ecg += spike;
      }

      // 添加 T 波（在 QRS 后面一点）
      if (timeInCycle > 0.05 && timeInCycle < 0.15) {
        const tWave = Math.exp(-30 * (timeInCycle - 0.1)) * 0.6;
        ecg += tWave;
      }

      // 添加随机噪声
      ecg += (Math.random() - 0.5) * 0.1;

      return ecg;
    },
    simulateRealTimeECG(callback) {
      setInterval(() => {
        const data = [];
        for (let i = 0; i < 120; i++) {
          data.push(this.generateECGSample(this.dataIndex));
          this.dataIndex++;
        }

        // 模拟传递给 callback 的参数
        callback(1, ['II'], datas); // num=1, text=['II'], zhi=data
      }, 1000); // 每秒更新一次
    },
    onDurationChange(e) {
      this.duration = e.detail.value;
      this.updateGridSizes();
    },

    onSpeedChange(e) {
      this.speed = e.detail.value;
      this.updateGridSizes();
    },

    onVoltageScaleChange(e) {
      this.voltageScale = e.detail.value;
    },

    updateGridSizes() {
      // 获取组件实例并更新网格大小
      const ecgGrid = this.$refs.ecgGrid;
      if (ecgGrid) {
        this.pigK = ecgGrid.pigK;
        this.smallK = ecgGrid.smallK;
      }
    }
  }
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  background: linear-gradient(135deg, #1a2a6c, #2c3e50);
  min-height: 100vh;
}

.controls {
  background: rgba(30, 40, 80, 0.6);
  border-radius: 15px;
  padding: 15px;
  margin-top: 20px;
}

.control-group {
  background: rgba(20, 30, 60, 0.7);
  padding: 15px;
  border-radius: 10px;
  border-left: 4px solid #8e2de2;
  margin-bottom: 15px;
}

.control-title {
  font-size: 18px;
  font-weight: 600;
  color: #8e2de2;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.control-title::before {
  content: '⚙️';
  margin-right: 10px;
}

.slider-container {
  margin-bottom: 15px;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #ecf0f1;
}

.highlight {
  color: #8e2de2;
  font-weight: bold;
}

.value-display {
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  color: #ecf0f1;
  margin-top: 8px;
  font-family: monospace;
}
</style>
