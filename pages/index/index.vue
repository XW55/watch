<template>
  <view class="container">
    <qiun-data-charts type="line" :opts="gsrOption" :chartData="gsrData" canvasId="lineChart" />
  </view>
</template>

<script>
export default {
  data() {
    return {
      index: 0,
      gsrData: {
        categories: [], // 初始化 categories
        series: [{ name: '皮电', data: [] }]
      },
      startTime: Date.now(), // 记录开始时间
      gsrOption: {
        update: true,
        animation: true,

        duration: 0,
        color: ['#1890FF'],
        padding: [15, 10, 0, 15],
        dataLabel: false,
        dataPointShape: false,
        enableScroll: false,
        legend: {},
        xAxis: {
          disableGrid: true
        },
        yAxis: {
          gridType: 'dash',
          splitNumber: 4,
          data: [
            {
              min: 0,
              max: 2
            }
          ],
          format: (val) => val.toFixed(3) // 关键：格式化显示
        },
        extra: {
          line: {
            type: 'curve',
            width: 2,
            activeType: 'hollow',
            linearType: 'custom'
          }
        }
      }
    };
  },
  mounted() {
    // this.startSimulation();
  },
  methods: {
    startSimulation() {
      setInterval(() => {
        this.index++;
        const newValue = Math.random() * 2;
        this.gsrData.categories.push(this.index);
        this.gsrData.series[0].data.push(newValue);
        // 控制最大点数
        const POINTS_TO_KEEP = 10;
        if (this.gsrData.categories.length > POINTS_TO_KEEP) {
          this.gsrData.categories.shift();
          this.gsrData.series[0].data.shift();
        }
        if (this.index >= 10) {
          this.index = 0;
        }
      }, 150);
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  height: 400px;
}
</style>
