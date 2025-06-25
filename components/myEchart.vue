<template>
  <view style="width: 100%; height: 100%">
    <!-- #ifdef APP-PLUS || H5 -->
    <view class="echarts" :prop="option" :change:prop="echarts.updateEcharts" :id="id"></view>
    <!-- #endif -->
  </view>
</template>

<script>
export default {
  name: 'LineEcharts',
  props: ['option', 'id'],
  data() {
    return {};
  },
  methods: {
    // 动态改变配置数据
    changeOption() {}
  }
};
</script>

<script module="echarts" lang="renderjs">
import * as echarts from '@/utils/echarts.min.js';

export default {
    mounted() {
        let that = this;
        // 通过nextTick异步画图
        this.$nextTick(() => {
            that.initEcharts()
        });

    },
    methods: {
        // 初始化
        initEcharts() {
            this.myChart = echarts.init(document.getElementById(this.id))
            this.myChart.setOption(this.option);

            // 这里是用于窗口变化时的自适应，利用的是echarts自带的resize方法
            window.addEventListener('resize', () => {
                this.myChart.resize()
            });
        },

        // 监听配置数据变化，并重新渲染
        updateEcharts(newValue, oldValue, ownerInstance, instance) {
            if (this.myChart) {
                // this.myChart.clear();
                this.myChart.setOption(newValue);
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.echarts {
  width: 100%;
  height: 100%;
}
</style>
