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
  }

  drawInit() {
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  drawbg() {
    this.ctx.lineWidth = 1
    this.ctx.beginPath()
    this.ctx.strokeStyle = '#F2847F'
    //设置虚线,原生canvas对象
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
    //横着从中间向上下画横线，间隔interval
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
    this.data = {
      value: [...data]
    }
    this.progress = 0
    this.frequency = 0
    this.clearTimer()
    this.drawInit()
    this.drawbg()
    this.ctx.draw(false)
    this.drawMain()
  }

  drawMain() {
    let maxTime = 14
    if (this.type.indexOf('12') != -1) maxTime = 9
    this.ctxTimer = null
    let zero = this.h / 2
    this.ctxTimer = setInterval(() => {
      this.ctx.lineWidth = 2
      this.ctx.strokeStyle = '#000'
      this.ctx.setLineDash([])
      this.ctx.beginPath()
      this.ctx.moveTo(this.progress * this.w / 100, zero - this.getScrollY(this.data.value[this.progress * 5 + (
        this.timeSet * 100) * this.frequency]) * 2 * this.interval / 2)
      this.ctx.lineTo((this.progress + 0.25) * this.w / 100, zero - this.getScrollY(this.data.value[(this
        .progress * 5) + 2 + (this.timeSet * 100) * this.frequency]) * 2 * this.interval / 2)
      this.ctx.lineTo((this.progress + 0.5) * this.w / 100, zero - this.getScrollY(this.data.value[(this
        .progress * 5) + 3 + (this.timeSet * 100) * this.frequency]) * 2 * this.interval / 2)
      this.ctx.lineTo((this.progress + 0.75) * this.w / 100, zero - this.getScrollY(this.data.value[(this
        .progress * 5) + 4 + (this.timeSet * 100) * this.frequency]) * 2 * this.interval / 2)
      this.ctx.lineTo((this.progress + 1) * this.w / 100, zero - this.getScrollY(this.data.value[(this.progress +
        1) * 5 + (this.timeSet * 100) * this.frequency]) * 2 * this.interval / 2)
      this.ctx.stroke()
      if (this.progress == 99 && this.frequency == maxTime) {
        this.progress = 0
        this.frequency = 0
        this.clearTimer()
      } else if (this.progress == 99) {
        this.progress = 0
        this.frequency++
        this.drawInit()
        this.drawbg()
        this.ctx.draw(false)
      } else {
        this.progress++
        this.ctx.draw(true)
      }
    }, 49)
  }

  getScrollY(value) {
    if (value > 2) return 2
    if (value < -2) return -2
    return value
  }

  clearTimer() {
    console.log('试图关闭定时器')
    clearInterval(this.ctxTimer)
    this.ctxTimer = null
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