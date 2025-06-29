<template>
  <view class="ecg-grid-container">
    <!-- 画布容器 -->
    <view class="ecg-container" :style="{ height: containerHeight + 'px' }">
      <canvas
        :canvas-id="canvasId"
        :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
        class="ecg-canvas"
      ></canvas>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    // 显示时长(秒)
    duration: {
      type: Number,
      default: 5
    },
    // 走纸速度(mm/s)
    speed: {
      type: Number,
      default: 25
    },
    // 电压灵敏度(mm/mV)
    voltageScale: {
      type: Number,
      default: 2
    },
    // 采样率(Hz)
    sampleRate: {
      type: Number,
      default: 250
    },
    // 导联配置
    lineObj: {
      type: Object,
      default: () => ({
        num: 1,
        text: ['II'],
        data: [[]]
      })
    },
    // 容器高度
    containerHeight: {
      type: Number,
      default: 500
    }
  },

  data() {
    return {
      canvasId: `ecgCanvas_${Math.random().toString(36).substr(2, 9)}`,
      canvasWidth: 0,
      canvasHeight: 0,
      pigK: 0,
      smallK: 0,

      ecgData: [],
      dataBuffer: [], // 接收数据用的缓冲区
      visibleData: [], // 当前可视窗口的数据
      lastDrawIndex: 0, // 上次绘制的索引
      offsetX: 0, // 滚动偏移量（可选）
      systemInfo: null,
      pixelRatio: 1,
      animationFrame: null,
      startTime: null,
      isInitialized: false,

      // 每帧绘制点数
      pointsPerFrame: 5, // 每帧绘制 5 个点，提升流畅度
      maxVisiblePoints: 0, // 最多显示点数
      xIncrement: 0, // 每个点横向间距
      verticalScale: 0, // 垂直缩放比例
      lineHeight: 0 // 每个导联的高度
    };
  },

  computed: {
    bigGridTime() {
      return 0.2;
    },
    bigGridCount() {
      return this.duration / this.bigGridTime;
    },
    maxPoints() {
      return this.duration * this.sampleRate;
    }
  },

  watch: {
    duration() {
      this.calculateSizes();
      this.resetBuffer();
    },
    speed() {
      this.calculateSizes();
      this.resetBuffer();
    },
    voltageScale() {
      this.calculateSizes();
      this.redraw();
    },
    lineObj: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (newVal.data && Array.isArray(newVal.data) && newVal.data.length > 0) {
          this.dataBuffer = [...this.dataBuffer, ...newVal.data[0]];
          this.isInitialized = true;

          // 如果还没开始动画，则启动
          if (!this.animationFrame) {
            this.startAnimation();
          }
        }
      }
    },
    containerHeight() {
      this.calculateSizes();
      this.redraw();
    }
  },

  mounted() {
    this.init();
  },

  beforeDestroy() {
    if (this.animationFrame) {
      clearTimeout(this.animationFrame);
    }
  },

  methods: {
    init() {
      this.systemInfo = uni.getSystemInfoSync();
      this.pixelRatio = this.systemInfo.pixelRatio || 1;

      this.calculateSizes();

      // 计算最大可见点数
      this.maxVisiblePoints = Math.floor(this.canvasWidth / this.xIncrement);

      this.pointsPerFrame = Math.max(1, Math.floor(this.sampleRate / 30)); // 提高帧率
      this.resetBuffer();
    },

    calculateSizes() {
      const maxWidth = Math.min(this.systemInfo.windowWidth * 0.95, 800);
      this.canvasWidth = maxWidth;

      // 大格尺寸计算
      this.pigK = this.canvasWidth / this.bigGridCount;
      this.smallK = this.pigK / 5;

      // 加一个小格作为安全边距
      this.canvasWidth += this.smallK;
      this.canvasHeight = this.containerHeight + this.smallK;

      // 横向缩放：放大为原来的 1.5 倍，让波形更宽
      this.xIncrement = ((this.speed * this.pigK) / (5 * this.sampleRate)) * 1.5;

      // 垂直缩放
      this.verticalScale = this.voltageScale * (this.pigK / 5);

      // 每个导联的高度
      this.lineHeight = this.canvasHeight / this.lineObj.num;
    },

    resetBuffer() {
      this.dataBuffer = [];
      this.visibleData = [];
      this.lastDrawIndex = 0;
      this.offsetX = 0;
      this.isInitialized = false;
    },

    startAnimation() {
      if (this.animationFrame) return;

      const animate = () => {
        this.drawECG();
        this.animationFrame = setTimeout(animate, 1000 / 10); // 60 FPS
      };

      animate();
    },

    drawGrid(ctx) {
      const width = this.canvasWidth;
      const height = this.canvasHeight;

      ctx.clearRect(0, 0, width, height);

      // 背景填充
      ctx.setFillStyle('#ffffff');
      ctx.fillRect(0, 0, width, height);

      // 小格线
      ctx.setStrokeStyle('rgba(255, 0, 0, 0.2)');
      ctx.setLineWidth(0.2);
      for (let x = 0; x <= width; x += this.smallK) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y += this.smallK) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 大格线
      ctx.setStrokeStyle('#ff6666');
      ctx.setLineWidth(0.5);
      for (let x = 0; x <= width; x += this.pigK) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y += this.pigK) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    },

    drawECG() {
      // 创建上下文
      const ctx = uni.createCanvasContext(this.canvasId, this.$scope);

      // 1. 先绘制背景网格
      this.drawGrid(ctx);

      const { lineObj, voltageScale, verticalScale, lineHeight } = this;

      // 2. 更新可见数据
      const availablePoints = this.dataBuffer.length - this.lastDrawIndex;
      const pointsToDraw = Math.min(this.pointsPerFrame, availablePoints);

      if (pointsToDraw > 0) {
        const newPoints = this.dataBuffer.slice(this.lastDrawIndex, this.lastDrawIndex + pointsToDraw);
        this.visibleData = [...this.visibleData, ...newPoints];

        // 限制长度
        if (this.visibleData.length > this.maxVisiblePoints) {
          this.visibleData = this.visibleData.slice(-this.maxVisiblePoints);
        }

        this.lastDrawIndex += pointsToDraw;
      }

      if (this.visibleData.length < 2) {
        ctx.draw(true);
        return;
      }

      // 3. 绘制波形
      for (let line = 0; line < lineObj.num; line++) {
        ctx.beginPath();
        const startY = lineHeight * (line + 0.5);

        const startX = this.canvasWidth - this.visibleData.length * this.xIncrement;

        for (let i = 0; i < this.visibleData.length; i++) {
          const value = this.visibleData[i] || 0;
          const x = startX + i * this.xIncrement;
          const y = startY - value * verticalScale;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        const colors = ['#000', '#000', '#000', '#ffd166', '#ef476f'];
        ctx.setStrokeStyle(colors[line % colors.length]);
        ctx.setLineWidth(1); // 加粗线条更清晰
        ctx.stroke();
      }

      // 4. 提交绘制
      ctx.draw(false);
    },

    redraw() {
      this.drawECG();
    }
  }
};
</script>

<style scoped>
.ecg-grid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ecg-container {
  position: relative;
  overflow: hidden;
  margin-top: 20px;
}
</style>
