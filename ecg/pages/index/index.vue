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

    <view class="controls">
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
import { getdata } from '@/utils/zongble2.js';
import EcgGrid from '../../components/ecgGrid.vue';
import { datas } from '@/utils/data.js';
import { mapState, mapMutations } from 'vuex';
export default {
  components: {
    EcgGrid
  },

  data() {
    return {
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
      realTimeData: [] // 实时数据存储
    };
  },

  computed: {
    ...mapState(['xindianble', 'pidianble']),
    bigGridCount() {
      return this.duration / 0.2;
    }
  },

  mounted() {
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

  methods: {
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
    // 父组件中的getbleshuju方法
    getbleshuju() {
      let that = this;
      getdata((num = 1, text = ['II'], zhi) => {
        // 直接传递新数据（无需缓冲）
        that.lineObj = {
          num: num,
          text: text,
          data: [zhi] // 直接传递新数据数组
        };
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
