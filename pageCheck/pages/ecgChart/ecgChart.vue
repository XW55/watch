<template>
  <view>
    <view v-if="kaishihuatu" class="" @click="kaishi">开始</view>
    <view v-else class="chartBox">
      <view @click="kaishi" class="">返回</view>
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
      ecgData,
      kaishihuatu: true
    };
  },
  mounted() {
    this.options = ecgConfig({ name: 'II', data: ecgData });
    console.log(this.options);
  },
  onLoad() {},
  methods: {
    kaishi() {
      this.kaishihuatu = !this.kaishihuatu;
    }
  }
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
