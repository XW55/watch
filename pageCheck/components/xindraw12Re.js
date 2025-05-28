// const width = uni.getSystemInfoSync().windowWidth;
// const zoom = width / 750;

// let totalData = [];
// let timeSet; // 定时器
// let lineNum = 12; // 导联数（线的数量）
// let lineHeight = 0; // 每格线的高度
// let cv_height = 0; // 画布总高度
// let ecgType = ''; // 心电类型

// /**
//  * 高度转换函数，将原始信号值转为实际坐标高度
//  * @param val
//  * @returns {number}
//  */
// const comData = (val) => {
//   return lineHeight / 2 * val;
// }

// /**
//  * 清除所有定时器
//  */
// export function clear() {
//   if (timeSet) {
//     clearInterval(timeSet);
//     timeSet = null;
//   }
// }

// // 每次更新一列的时间间隔（毫秒），确保整个绘制过程在2秒内完成
// const drawInterval = 2000 / 500; // 假设每条线有500个点

// /**
//  * 启动绘图入口函数
//  * @param ctx - 画布上下文
//  * @param height - 每行高度
//  * @param sig - 数据源（二维数组，12通道，各含500个数据）
//  * @param type - 类型标识（如 '12' 表示多导联）
//  */
// export function xindraw(ctx, height, sig, type) {
//   console.log("xindraw", ctx, height, type);

//   ecgType = type;
//   lineHeight = height;
//   cv_height = height * lineNum;
//   totalData = [...sig];

//   // 清除旧的定时器
//   clear();

//   // 清空画布
//   ctx.clearRect(0, 0, 750 * zoom, cv_height);
//   setLineStyle(ctx);

//   let i = 1;

//   // 开始逐列绘制
//   timeSet = setInterval(() => {
//     drawFrame(ctx, i);
//     if (i >= 500) { // 修改这里以确保在到达最后一个数据点时停止
//       clear(); // 绘制完成后清除定时器
//     }
//     i++;
//   }, drawInterval);
// }

// /**
//  * 单帧绘制逻辑：绘制当前列的所有导联
//  * @param ctx
//  * @param i 当前第几列（像素位置）
//  */
// function drawFrame(ctx, i) {
//   for (let j = 0; j < lineNum; j++) {
//     drawLine(ctx, i, j);
//   }

//   // #ifdef APP || H5
//   ctx.draw && ctx.draw(false); // 非清除重绘
//   // #endif
// }

// /**
//  * 绘制单条线（单导联）的一段线段
//  * @param ctx - 画布上下文
//  * @param i - 当前列数（横坐标）
//  * @param j - 第几个导联（纵坐标）
//  */
// function drawLine(ctx, i, j) {
//   const dataIndex = Math.floor((i - 1)); // 直接使用i作为索引
//   const nextIndex = Math.floor(i);

//   let pointX = comData(totalData[j][dataIndex]);
//   let endX = comData(totalData[j][nextIndex]);

//   // 抗溢出处理
//   if (Math.abs(pointX) > lineHeight / 2) {
//     pointX = pointX > 0 ? lineHeight / 2 : -lineHeight / 2;
//   }
//   if (Math.abs(endX) > lineHeight / 2) {
//     endX = endX > 0 ? lineHeight / 2 : -lineHeight / 2;
//   }

//   ctx.beginPath();
//   ctx.moveTo(i - 1, lineHeight * j + lineHeight / 2 - pointX);
//   ctx.lineTo(i, lineHeight * j + lineHeight / 2 - endX);
//   ctx.stroke();
// }

// /**
//  * 设置线条样式
//  * @param ctx
//  */
// function setLineStyle(ctx) {
//   // #ifdef APP || H5
//   ctx.setStrokeStyle("#000");
//   ctx.setLineWidth(2);
//   // #endif
//   // #ifdef MP-WEIXIN
//   ctx.strokeStyle = "#000";
//   ctx.lineWidth = 2;
//   // #endif
// }


// 5s----------------------------------
// xindraw.js

// 获取系统屏幕宽度并计算缩放比例（适配不同屏幕）
const width = uni.getSystemInfoSync().windowWidth;
const zoom = width / 750;

// 心电图配置参数
let lineNum = 12; // 心电图导联数（共画12条线）
let lineHeight = 0; // 每条线的高度（由外部传入）

// 动画控制变量
let drawTimer = null; // 定时器ID
let progressIndex = 0; // 当前已绘制到第几个点
let totalData = []; // 存储当前要绘制的数据
let canvasCtx = null; // Canvas上下文对象
let canvasWidth = 750 * zoom; // 画布宽度（像素）
let cv_height = 0; // 总画布高度（像素）

/**
 * 将信号值转换为实际坐标高度
 * @param val - 原始信号值
 * @returns {number} - 实际Y轴坐标
 */
const comData = (val) => {
  return lineHeight / 2 * val;
};

/**
 * 启动绘图入口函数（初始化并开始动画）
 * @param ctx - Canvas 上下文对象（uni.createCanvasContext 返回的）
 * @param height - 每行高度（从页面获取）
 * @param sig - 数据源（二维数组，12通道，各含1250个数据）
 */
export function xindraw(ctx, height, sig) {
  // 清除上一次的动画和数据
  clear();

  // 初始化参数
  canvasCtx = ctx;
  lineHeight = height;
  cv_height = height * lineNum;
  totalData = [...sig]; // 拷贝当前数据
  canvasWidth = 750 * zoom;
  progressIndex = 0;

  const duration = 5000; // 总动画时间：5秒
  const totalPoints = 1250; // 每条线有1250个数据点
  const frameDuration = 16; // 每帧间隔约 60fps

  const startTime = Date.now(); // 动画开始时间

  // 开始逐帧绘制
  drawFrame(startTime, frameDuration, duration, totalPoints);
}

/**
 * 逐帧绘制函数（每一帧更新部分数据）
 * @param startTime - 动画开始时间戳
 * @param frameDuration - 每帧间隔时间（毫秒）
 * @param duration - 总动画时间（毫秒）
 * @param totalPoints - 每条线的总数据点数量
 */
function drawFrame(startTime, frameDuration, duration, totalPoints) {
  if (!canvasCtx) return;

  const now = Date.now();
  const progress = Math.min((now - startTime) / duration, 1); // 进度百分比 0~1
  const currentPointIndex = Math.floor(progress * totalPoints); // 当前要绘制到第几个点

  if (currentPointIndex > progressIndex) {
    progressIndex = currentPointIndex;

    // 清空画布
    canvasCtx.clearRect(0, 0, canvasWidth, cv_height);

    // 设置线条样式
    setLineStyle(canvasCtx);

    // 绘制所有导联
    for (let j = 0; j < lineNum; j++) {
      drawLineSegment(canvasCtx, j, totalData[j], currentPointIndex);
    }

    // 提交绘制（刷新画布）
    canvasCtx.draw(true);
  }

  // 如果还没完成，则继续下一帧
  if (progress < 1) {
    drawTimer = setTimeout(() => {
      drawFrame(startTime, frameDuration, duration, totalPoints);
    }, frameDuration);
  } else {
    // 动画完成，清除定时器
    clearInterval(drawTimer);
    drawTimer = null;
  }
}

/**
 * 绘制单条线的一段数据
 * @param ctx - Canvas 上下文
 * @param index - 第几条线（0~11）
 * @param data - 当前导联的数据（长度为1250）
 * @param currentPointIndex - 当前要画到第几个点
 */
function drawLineSegment(ctx, index, data, currentPointIndex) {
  const ratio = canvasWidth / 1250; // 数据长度与画布宽度的比例

  ctx.beginPath();

  for (let i = 1; i <= currentPointIndex && i < data.length; i++) {
    const x1 = (i - 1) * ratio;
    const x2 = i * ratio;

    const y1 = comData(data[i - 1]);
    const y2 = comData(data[i]);

    ctx.moveTo(x1, lineHeight * index + lineHeight / 2 - y1);
    ctx.lineTo(x2, lineHeight * index + lineHeight / 2 - y2);
  }

  ctx.stroke();
}

/**
 * 设置线条样式
 * @param ctx - Canvas 上下文
 */
function setLineStyle(ctx) {
  ctx.setLineWidth(1); // 设置线宽
  ctx.setStrokeStyle("#000"); // 设置颜色为黑色
}

/**
 * 清除所有定时器和数据（用于重置）
 */
export function clear() {
  if (drawTimer) {
    clearTimeout(drawTimer);
    drawTimer = null;
  }
  progressIndex = 0;
  totalData = [];
  canvasCtx = null;
}