<template>
  <view>
    <view class="chartBox">
      <view class="chartItem" v-for="(item, i) in 12" :key="i">
        <MyChart :option="options" :id="'ecgChart' + i"></MyChart>
      </view>
    </view>
  </view>
</template>

<script>
import { ecgConfig, ecgData } from '@/utils/ecgChart.js';
import MyChart from '@/components/myEchart.vue';
export default {
  components: {
    MyChart
  },
  data() {
    return {
      options: {},
      ecgData
    };
  },
  mounted() {
    this.options = ecgConfig({ name: 'II', data: ecgData });
    console.log(this.options);
  },
  onLoad() {},
  methods: {}
};
</script>
<style lang="scss" scoped>
.chartBox {
  width: 100%;
  height: 100vh;
  .chartItem {
    height: calc((100vh - 120px) / 12);
  }
}
</style>
