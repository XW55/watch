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
    disableGrid: true
  },
  yAxis: {
    gridType: 'dash',
    dashLength: 2,
    data: [],
    splitNumber: 4,
    data: [{
      min: -5,
      max: 5
    }],
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
    disableGrid: true
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