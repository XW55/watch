<template>
  <view class="container">
    <!-- 控制按钮 -->
    <button @click="initAndStartScan">初始化并开始搜索</button>
    <button v-if="isScanning" @click="stopScan">停止搜索</button>
    <!-- <button @click="print">打印日志</button> -->

    <!-- 设备列表 -->
    <text v-if="devices.length === 0 && !isScanning">暂无设备，请开始搜索</text>
    <text v-if="devices.length === 0 && isScanning">正在搜索中...</text>

    <block v-for="device in devices" :key="device.deviceId">
      <view class="device-item" @click="connectToDevice(device.deviceId)">
        <text>{{ device.name || '未知设备' }} - {{ device.deviceId }}</text>
      </view>
    </block>

    <!-- 实时数据展示 -->
    <!--    <view v-if="bleData" class="data-display">
      <h3>最新数据：</h3>
      <pre>{{ JSON.stringify(bleData, null, 2) }}</pre>
    </view> -->

    <!-- 折线图展示 -->
    <qiun-data-charts type="line" :opts="xyzOption" :chartData="chartData" />
    <qiun-data-charts type="line" :opts="baseOption" :chartData="redData" />
    <qiun-data-charts type="line" :opts="gsrOption" :chartData="gsrData" />

    <!-- 状态提示 -->
    <text v-if="status">{{ status }}</text>
  </view>
</template>

<script>
import {
  initBluetooth,
  startScanBluetooth,
  stopScanBluetooth,
  getDiscoveredDevices,
  connectToDevice
} from '@/utils/bluetooth';
import { processIncomingData, setOnDataParsed } from '@/utils/config.js'; // 注意路径可能需要调整
import { baseOption, xyzOption } from '@/utils/echartsOption.js';
export default {
  data() {
    return {
      xyzOption,
      tempGsrData: [], // 临时存储
      isUpdating: false, // 标识是否正在更新
      baseOption,
      isScanning: false,
      devices: [],
      status: '',
      bleData: null, // 存储解析后的数据
      chartData: {
        categories: [], // 时间戳作为X轴标签
        series: [
          { name: 'X', data: [] },
          { name: 'Y', data: [] },
          { name: 'Z', data: [] }
        ]
      },
      redData: {
        categories: [],
        series: [
          { name: '红光', data: [] },
          { name: '红外光', data: [] }
        ]
      },
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
          data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        },
        yAxis: {
          gridType: 'dash',
          splitNumber: 4,
          data: [
            {
              min: 0,
              max: 2
            }
          ]
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
      gsrIndex: 0,
      accIndex: 1 // 自增索引，用于模拟X轴标签
    };
  },
  mounted() {
    this.updateDeviceList();

    // 注册回调，接收解析后的数据
    setOnDataParsed((type, data) => {
      if (type.toUpperCase() == 'GSR') {
        console.log('皮电', data);
      }
      // console.log(`收到 ${type.toUpperCase()} 数据`, data);
      this.bleData = data;
      this.updateChartData(data);
    });
  },
  methods: {
    async initAndStartScan() {
      this.devices = [];
      try {
        await initBluetooth();
        this.isScanning = true;
        this.status = '正在搜索...';
        await startScanBluetooth();
      } catch (err) {
        this.status = '蓝牙初始化失败';
      }
    },

    async stopScan() {
      try {
        await stopScanBluetooth();
        this.isScanning = false;
        this.status = '搜索已停止';
      } catch (err) {
        this.status = '停止搜索失败';
      }
    },

    updateDeviceList() {
      setInterval(() => {
        this.devices = getDiscoveredDevices();
      }, 500);
    },

    async connectToDevice(deviceId) {
      this.status = `正在连接 ${deviceId}...`;
      try {
        await connectToDevice(deviceId, (data) => {
          processIncomingData(data); // 处理接收到的数据
        });
        this.status = `连接成功：${deviceId}`;
      } catch (err) {
        this.status = `连接失败：${err.errMsg}`;
      }
    },

    print() {
      console.log('当前缓冲区:', this.buffer);
    },

    updateChartData(data) {
      if (data.acc) {
        this.chartData.categories.push(++this.accIndex);
        this.chartData.series[0].data.push(data.acc.x); // X轴
        this.chartData.series[1].data.push(data.acc.y); // Y轴
        this.chartData.series[2].data.push(data.acc.z); // Z轴
        if (this.chartData.categories.length > 10) {
          this.chartData.categories.shift();
          this.chartData.series.forEach((s) => s.data.shift());
        }
      }

      if (data.red && data.infrared) {
        const redValues = data.red.flat().map((item) => item.value);
        const infraredValues = data.infrared.flat().map((item) => item.value);
        const avgRed = redValues.reduce((a, b) => a + b, 0) / redValues.length;
        const avgIr = infraredValues.reduce((a, b) => a + b, 0) / infraredValues.length;

        this.redData.categories.push(this.accIndex);
        this.redData.series[0].data.push(avgRed);
        this.redData.series[1].data.push(avgIr);
        if (this.redData.categories.length > 10) {
          this.redData.categories.shift();
          this.redData.series.forEach((s) => s.data.shift());
        }
      }

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
        if (this.gsrIndex >= 10) {
          this.gsrIndex = 1;
        }

        // // 动态调整 Y 轴范围（可选）
        // const values = this.gsrData.series[0].data;
        // if (values.length > 0) {
        //   const maxVal = Math.max(...values);
        //   const minVal = Math.min(...values);
        //   const padding = (maxVal - minVal) * 0.1;

        //   this.gsrOption.yAxis.min = minVal - padding;
        //   this.gsrOption.yAxis.max = maxVal + padding;
        // }

        // 强制响应式更新
        // this.$set(this, 'gsrData', { ...this.gsrData });
        // this.$set(this, 'gsrOption', { ...this.gsrOption });

        // 设置下一个定时器
        setTimeout(() => this.updateChartWithDelay(), 100); // 每隔0.1秒更新一次
      } else {
        this.isUpdating = false; // 更新完成
      }
    }
  }
};
</script>

<style>
.container {
  padding: 20px;
}
.device-item {
  margin-top: 10px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
}
.data-display {
  margin-top: 20px;
  background: #f9f9f9;
  padding: 15px;
  white-space: pre-wrap;
  font-family: monospace;
}
</style>
