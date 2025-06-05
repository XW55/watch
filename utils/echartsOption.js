export const baseOption = {
  animation: true, // 关闭动画
  update: true, // 关键：是否开启连续更新数据的方法,开启之后就不会抖动了
  duration: 0, // 关闭动画过度
  color: ['#1890FF', '#91CB74', '#FAC858'], // 根据系列数量调整颜色
  padding: [15, 10, 0, 15],
  dataLabel: false,
  dataPointShape: false,
  enableScroll: false,
  legend: {},
  xAxis: {
    disableGrid: true,
    disabled: true,
  },
  yAxis: {
    gridType: 'dash',
    dashLength: 2,
    data: [],
    splitNumber: 4,

    format: (val) => val.toFixed(3) // 关键：格式化显示)
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

export const xyzOption = {
  animation: true, // 关闭动画
  update: true, // 关键：是否开启连续更新数据的方法,开启之后就不会抖动了
  duration: 0, // 关闭动画过度
  color: ['#1890FF', '#91CB74', '#FAC858'], // 根据系列数量调整颜色
  padding: [15, 10, 0, 15],
  dataLabel: false,
  dataPointShape: false,
  enableScroll: false,
  legend: {},
  xAxis: {
    disableGrid: true,
    disabled: true,
  },
  yAxis: {
    gridType: 'dash',
    dashLength: 2,
    data: [],
    splitNumber: 4,
    format: (val) => val.toFixed(3) // 关键：格式化显示)
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

// @/utils/echartsOption.js

export const zhiOption = {
  legend: {
    data: ['X', 'Y', 'Z']
  },
  grid: {
    left: 15,
    right: 10,
    bottom: 0,
    top: 15
  },
  xAxis: {
    type: 'category',
    show: true,
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      show: false
    }, // 隐藏 x 轴标签
    splitLine: {
      show: false
    }, // 隐藏网格线
    data: [] // categories 数据会在这里动态更新
  },
  yAxis: {
    type: 'value',
    splitLine: {
      lineStyle: {
        type: 'dashed',
        width: 2,
        color: '#ccc'
      }
    },
    axisLabel: {
      formatter: function(value) {
        return value.toFixed(3); // 模拟 toFixed(3)
      }
    },
    splitNumber: 4
  },
  series: [{
      name: 'X',
      type: 'line',
      smooth: true, // 曲线
      symbol: 'none', // 不显示点
      lineStyle: {
        width: 2,
        color: '#1890FF'
      },
      data: []
    },
    {
      name: 'Y',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 2,
        color: '#91CB74'
      },
      data: []
    },
    {
      name: 'Z',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 2,
        color: '#FAC858'
      },
      data: []
    }
  ],
  animation: false
};