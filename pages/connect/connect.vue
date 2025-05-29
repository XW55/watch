<template>
  <view class="container">
    <!-- 控制按钮 -->
    <button @click="initAndStartScan">初始化并开始搜索</button>

    <!-- <button @click="downloadPPGDataAsTxt">下载PPG数据</button> -->
    <button v-if="isScanning" @click="stopScan">停止搜索</button>
    <!-- <button @click="print">打印日志</button> -->

    <!-- 设备列表 -->
    <text v-if="devices.length === 0 && !isScanning">暂无设备，请开始搜索</text>
    <text v-if="devices.length === 0 && isScanning">正在搜索中...</text>

    <block v-for="device in devices" :key="device.deviceId">
      <view class="device-item" @click="connectToDevice(device)">
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
import { processIncomingData, setOnDataParsed, ppgValuesHistory, gsrValuesHistory } from '@/utils/config.js'; // 注意路径可能需要调整
import { baseOption, xyzOption } from '@/utils/echartsOption.js';
import { updateEdaData } from '@/api/algorithm.js';
import { getCurrentTimeFormatted, GUID } from '@/utils/comm.js';
let gsrUpload = [];
export default {
  data() {
    return {
      ppgValuesHistory,
      gsrValuesHistory,
      isLog: true,
      xyzOption,
      tempGsrData: [], // 临时存储
      isUpdating: false, // 标识是否正在更新
      baseOption,
      isScanning: false,
      devices: [],
      deviceSn: '',
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
          { name: '1通道', data: [] },
          { name: '2通道', data: [] },
          { name: '3通道', data: [] },
          { name: '4通道', data: [] }
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
          disabled: true,
          data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        },
        yAxis: {
          gridType: 'dash',
          splitNumber: 4,
          data: [
            {
              min: 0,
              max: 5
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
      if (type.toUpperCase() == 'GSR' && this.isLog) {
        console.log('皮电', data);
        gsrUpload.push(...data.gsr);
        console.log('长度', gsrUpload.length);
        if (gsrUpload.length % 100 == 0) {
          this.uploadGsrData();
        }
      } else {
        // console.log('红外', data);
      }
      // console.log(`收到 ${type.toUpperCase()} 数据`, data);
      // this.bleData = data;
      this.updateChartData(data);
    });
  },
  methods: {
    uploadGsrData() {
      const dataToUpload = gsrUpload.slice(-100); // 取出最后100条数据

      console.log('10s上传皮电', dataToUpload);
      const obj = {
        pId: GUID(),
        eda: dataToUpload,
        patientName: '姓名',
        gender: '男',
        age: 20,
        patientPhone: '15360544778',
        patientCode: '411325200310186547',
        deviceSn: this.deviceSn,
        hospName: '医院名称',
        samplingRate: 10,
        recordDate: getCurrentTimeFormatted()
      };
      console.log('上传的数据', obj);
      console.log('此时长度', gsrUpload.length);

      // 调用上传函数
      updateEdaData(obj)
        .then((res) => {
          console.log(res);
          // 成功上传后，删除已上传的数据
          gsrUpload = gsrUpload.slice(100); // 删除前100个已上传的数据
        })
        .catch((err) => {
          console.error('上传失败:', err);
          // 失败时不清空缓存，下次重试
        });
    },
    downloadPPGDataAsTxt() {
      this.isLog = false;
      console.log('打印数据');
      console.log(ppgValuesHistory);
      console.log(gsrValuesHistory);
    },
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

    async connectToDevice(device) {
      this.deviceSn = device.deviceId;
      this.status = `正在连接 ${device.deviceId}...`;
      try {
        await connectToDevice(device.deviceId, (data) => {
          processIncomingData(data); // 处理接收到的数据
        });
        this.status = `连接成功：${device.deviceId}`;
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
        if (this.chartData.categories.length > 50) {
          this.chartData.categories.shift();
          this.chartData.series.forEach((s) => s.data.shift());
        }
      }

      if (data.red && data.infrared) {
        // 确保accIndex递增以反映新的时间点
        this.redData.categories.push(this.accIndex++);

        for (let i = 0; i < Math.min(data.red.length, data.infrared.length); i++) {
          const redValues = data.red[i].map((item) => item.value);
          const irValues = data.infrared[i].map((item) => item.value);

          // 假设redValues和irValues长度相同
          for (let j = 0; j < Math.max(redValues.length, irValues.length); j++) {
            if (j < redValues.length) {
              this.redData.series[i * 2].data.push(redValues[j]);
            }
            if (j < irValues.length) {
              this.redData.series[i * 2 + 1].data.push(irValues[j]);
            }
          }

          // 如果超出最大长度则移除最旧的数据
          if (this.redData.series[i * 2].data.length > 10) {
            this.redData.series[i * 2].data.shift();
          }
          if (this.redData.series[i * 2 + 1].data.length > 10) {
            this.redData.series[i * 2 + 1].data.shift();
          }
          if (this.redData.categories.length > 50) {
            this.redData.categories.shift();
          }
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
        if (this.gsrIndex >= 50) {
          this.gsrIndex = 1;
        }

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
