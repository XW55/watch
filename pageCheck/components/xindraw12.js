export class DrawEcg {
  constructor(ctx, cv_width, cv_height, type, lead) {
    this.timeSet = 5
    this.ctx = ctx
    this.cv_width = cv_width
    this.cv_height = cv_height
    this.zoom = uni.getSystemInfoSync().windowWidth / 750
    this.w = cv_width * this.zoom
    this.interval = this.w / 10
    this.h = cv_height * this.zoom
    this.type = type
    this.lead = lead
    this.progress = 0
    this.frequency = 0
    this.data = {
      value: [],
    }
    this.beginTime = 0
    this.drawInit()
    this.drawbg()
    this.ctx.draw()
    this.ctxTimer = null
    this.frameIndex = 0 // 新增：记录当前帧数
    this.totalFrames = 499 // 新增：总共要绘制的线段数
    this.animationFrameId = null // 新增：用于取消动画帧
  }

  drawInit() {
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  drawbg() {
    this.ctx.lineWidth = 1
    this.ctx.beginPath()
    this.ctx.strokeStyle = '#F2847F'
    this.ctx.setLineDash([5, 3])
    for (let i = 0; i < 11; i++) {
      if (i != 10) {
        this.ctx.moveTo(i * this.interval || 1, this.h / 2 - 2 * this.interval)
        this.ctx.lineTo(i * this.interval || 1, this.h / 2 + 2 * this.interval)
        this.ctx.stroke()
      } else {
        this.ctx.moveTo(i * this.interval - 1 || 1, this.h / 2 - 2 * this.interval)
        this.ctx.lineTo(i * this.interval - 1 || 1, this.h / 2 + 2 * this.interval)
        this.ctx.stroke()
      }
    }
    this.ctx.moveTo(1, this.h / 2)
    this.ctx.lineTo(this.w, this.h / 2)
    for (let i = 1; i < 5; i++) {
      this.ctx.moveTo(1, this.h / 2 - i * this.interval)
      this.ctx.lineTo(this.w, this.h / 2 - i * this.interval)
      this.ctx.moveTo(1, this.h / 2 + i * this.interval)
      this.ctx.lineTo(this.w, this.h / 2 + i * this.interval)
      this.ctx.stroke()
    }
  }

  setData(data) {
    console.log('切换了数据')
    this.data = {
      value: [...data]
    }
  }

  drawEcg(data) {
    // console.log('开始绘制新数据')
    try {
      this.clearTimer()
      this.frameIndex = 0
      this.data = {
        value: [...data]
      }
      this.drawInit()
      this.drawbg()
      this.ctx.draw(false)
      this.startTime = Date.now(); // 更新开始时间
      this.drawFrame()
    } catch (e) {
      console.log("画II导联报错");
      console.log(e);
    }

  }

  drawFrame() {
    const renderFrame = () => {
      const elapsed = Date.now() - this.startTime
      const progress = Math.min(elapsed / 2000, 1) // 总时长2s
      const frameToDraw = Math.floor(progress * this.totalFrames)

      this.ctx.beginPath()
      this.ctx.strokeStyle = '#000'
      this.ctx.setLineDash([])
      this.ctx.lineWidth = 1

      // 绘制到当前帧
      for (let i = this.frameIndex; i < frameToDraw; i++) {
        const x1 = (i / 499) * this.w
        const y1 = this.h / 2 - this.getScrollY(this.data.value[i]) * 2 * this.interval / 2
        const x2 = ((i + 1) / 499) * this.w
        const y2 = this.h / 2 - this.getScrollY(this.data.value[i + 1]) * 2 * this.interval / 2

        this.ctx.moveTo(x1, y1)
        this.ctx.lineTo(x2, y2)
      }

      this.ctx.stroke()
      this.ctx.draw(true)

      this.frameIndex = frameToDraw

      if (progress < 1) {
        this.animationFrameId = setTimeout(renderFrame, 4); // 使用setTimeout来模拟requestAnimationFrame
      } else {
        // console.log('本次绘制完成')
      }
    }

    this.animationFrameId = setTimeout(renderFrame, 4); // 开始第一次调用
  }

  getScrollY(value) {
    if (value > 2) return 2
    if (value < -2) return -2
    return value
  }

  clearTimer() {
    // console.log('试图关闭定时器')
    if (this.animationFrameId) {
      clearTimeout(this.animationFrameId)
      this.animationFrameId = null
    }
  }
}


/**
 * 绘制心率半圆图
 */
export class DrawHreat {
  //构造函数
  constructor(ctx, cv_width, cv_height, value) {
    try {
      this.ctx = ctx
      this.cv_width = cv_width
      this.cv_height = cv_height
      this.value = value
      this.zoom = uni.getSystemInfoSync().windowWidth / 750
      this.w = cv_width * this.zoom
      this.h = cv_height * this.zoom
      this.drawInit()
      this.drawbg()
      this.drawText()
      this.ctx.draw()
      this.drawTime()
      this.timeout = null
    } catch (e) {
      console.log('class出错')
      console.log(e)
    }
  }

  clearTimer() {
    if (this.timeout)
      clearInterval(this.timeout)
  }

  /**
   * 重置画布内容
   */
  drawInit() {
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  drawbg() {
    //从9点到3点画一个半圆,线宽20*zoom
    this.ctx.beginPath()
    this.ctx.setLineCap('round'); // 设置圆环端点的形状
    this.ctx.strokeStyle = '#83EFD6'
    this.ctx.lineWidth = 20 * this.zoom
    this.ctx.arc(this.w / 2, (123 + 13 + 10) * 2 * this.zoom, 245 * this.zoom, -1 * Math.PI, 0)
    this.ctx.stroke()
  }

  drawLine() {
    this.ctx.beginPath()
    if (this.value > 120) {
      this.ctx.setStrokeStyle('#FF0000')
    } else if (this.value < 60) {
      this.ctx.setStrokeStyle('#FF0000')
    } else {
      this.ctx.setStrokeStyle('#00CA99')
    }
    this.ctx.lineWidth = 20 * this.zoom
    this.ctx.lineCap = 'round'
    this.ctx.arc(this.w / 2, (123 + 13 + 10) * 2 * this.zoom, 245 * this.zoom, -1 * Math.PI, (-1 + (this.value /
      180)) * Math.PI)
    this.ctx.stroke()
  }

  drawText() {
    this.ctx.setTextAlign('center')
    this.ctx.setTextBaseline('middle')
    //文字左对齐
    this.ctx.setTextAlign('left')
    this.ctx.setFillStyle('#000')
    this.ctx.setFontSize(22 * this.zoom)
    this.ctx.fillText('次/分', this.w / 2 + (5 * this.zoom), (123 + 13 + 10 - 35) * 2 * this.zoom)
  }

  drawValue() {
    this.ctx.setTextAlign('center')
    this.ctx.setTextBaseline('middle')
    this.ctx.setFontSize(30 * this.zoom)
    let text = ''
    if (this.value > 100) {
      this.ctx.setFillStyle('#FF0000')
      text = '—  心率过快  —'
    } else if (this.value == 0) {
      this.ctx.setFillStyle('#FF0000')
      text = '—  疑似导联脱落  —'
    } else if (this.value < 60) {
      this.ctx.setFillStyle('#FF0000')
      text = '—  心率过缓  —'
    } else {
      this.ctx.setFillStyle('#00CA99')
      text = '—  健康  —'
    }
    this.ctx.fillText(text, this.w / 2, (123 + 13 + 10 - 10) * 2 * this.zoom)
    this.ctx.setTextAlign('right')
    this.ctx.setFontSize(48 * this.zoom)
    this.ctx.fillText(this.value, this.w / 2 - (5 * this.zoom), (123 + 13 + 10 - 35) * 2 * this.zoom)
    //文字左对齐
  }

  drawTime() {
    //清除时间
    // this.ctx.clearRect(this.w / 2 - (24 * 7) * this.zoom, (123 + 13 + 10 + 10 - 12) * 2 * this.zoom, (24 * 7 * 2) * this.zoom, 24 * 2 * this.zoom)
    //画矩形
    function draw() {
      this.ctx.setFillStyle('#fff')
      this.ctx.clearRect(this.w / 2 - (24 * 7) * this.zoom, (123 + 13 + 10 + 10 - 12) * 2 * this.zoom, (24 * 7 * 2) *
        this.zoom, 24 * 2 * this.zoom)
      this.ctx.setTextAlign('center')
      this.ctx.setTextBaseline('middle')
      this.ctx.setFontSize(24 * this.zoom)
      let text = ''
      let time = new Date()
      let hour = time.getHours()
      let min = time.getMinutes()
      let sec = time.getSeconds()
      if (hour < 10) {
        hour = '0' + hour
      }
      if (min < 10) {
        min = '0' + min
      }
      if (sec < 10) {
        sec = '0' + sec
      }
      text = hour + ':' + min + ':' + sec
      this.ctx.setFillStyle('#aaa')
      this.ctx.fillText('— 更新时间：' + text + ' —', this.w / 2, (123 + 13 + 10 + 10) * 2 * this.zoom)
      this.ctx.draw(true)
    }
    //立即执行一次
    draw.bind(this)()
    this.timeout = setInterval(draw.bind(this), 1000)
  }

  setValue(value) {
    this.clearTimer()
    this.value = value
    this.drawInit()
    this.drawbg()
    this.drawLine()
    this.drawText()
    this.drawValue()
    this.ctx.draw()
    this.drawTime()
  }
}