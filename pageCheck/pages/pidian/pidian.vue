<template>
  <view class="container">
    <!-- 折线图展示 -->
    <qiun-data-charts type="line" :opts="xyzOption" :chartData="chartData" />
    <qiun-data-charts type="line" :opts="baseOption" :chartData="redData" />
    <qiun-data-charts type="line" :opts="gsrOption" :chartData="gsrData" />
  </view>
</template>

<script>
import { setOnDataParseds, getqiehuan, setzhuyes, setfuyes, setkaishijieshou } from '@/utils/zongble.js';
import { setOnDataParsed, ppgValuesHistory, gsrValuesHistory } from '@/utils/config.js'; // 注意路径可能需要调整
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
      gsrIndex: 0,
      accIndex: 1 // 自增索引，用于模拟X轴标签
    };
  },
  mounted() {
    // 注册回调，接收解析后的数据
    setOnDataParsed((type, data) => {
      console.log(type, data);
      if (type.toUpperCase() == 'GSR' && this.isLog) {
        gsrUpload.push(...data.gsr);
      } else {
        // console.log('红外', data);
      }

      this.updateChartData(data);
    }, 2);
  },
  onUnload() {
    console.log('离开皮电数据详情页面');
  },
  methods: {
    updateChartData(data) {
      // console.log('答应');
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

      if (data.samples && data.samples.length > 0) {
        // 记录当前时间点
        this.redData.categories.push(this.accIndex++);
        if (this.redData.categories.length > 50) {
          this.redData.categories.shift();
        }

        for (let i = 0; i < 4; i++) {
          let channelData = [];

          // 收集 red[i] 的值
          data.samples.forEach((sample) => {
            if (sample.red[i]) {
              channelData.push(sample.red[i].value);
            }
          });

          // 收集 infrared[i] 的值
          data.samples.forEach((sample) => {
            if (sample.infrared[i]) {
              channelData.push(sample.infrared[i].value);
            }
          });

          // 推入对应通道
          this.redData.series[i].data.push(...channelData);

          // 控制最大长度为10，超过则删除最早的数据
          if (this.redData.series[i].data.length > 50) {
            this.redData.series[i].data.splice(0, this.redData.series[i].data.length - 50);
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
