export const getChartConfig = (config) => {
  return {
    color: ['#1890FF', '#91CB74', '#FAC858', '#FF3333'], // 主题色
    legend: {
      data: config.legendData || [],
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        show: false // 隐藏X轴标签
      }
    },
    grid: {
      top: '15%'
      // containLabel: true
    },
    yAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: '#ccc'
        }
      },
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'solid', // 网格线为实线
          width: 0.5, // 线宽为 0.5px
          color: '#ccc' // 线条颜色为灰色
        }
      }
    },
    series: config.series || []
  };
}