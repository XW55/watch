<template>
  <page-meta :page-style="'overflow:' + (show ? 'hidden' : 'visible')"></page-meta>
  <view>
    <u-navbar
      :border="true"
      :placeholder="true"
      leftIcon="arrow-left"
      leftIconSize="20px"
      title="十二导检测"
      @leftClick="fanhui"
    ></u-navbar>
    <u-popup bgColor="transparent" :show="showw" mode="top" @close="closed">
      <view class="popup-tips" :style="{ paddingBottom: pbm }">{{ showTips[selectTips] }}</view>
    </u-popup>

    <view class="luang" v-if="qiehuan">
      <view class="shishishi">
        <view class="hreat-box">
          <view class="select-info">
            <view class="select-info-title title">
              {{ showHreat ? '心率' : '心电图' }}
              <text class="select-info-title-tips" v-if="!showHreat">(II导联)</text>
            </view>
            <view class="select-info-btn" v-if="!showHreat" @tap="openSwitchLead">
              查看详情
              <u-icon name="arrow-right"></u-icon>
            </view>
          </view>
          <view class="info-cv">
            <scroll-view
              scroll-x
              class="cvs-box"
              :upper-threshold="leftDistance"
              @scrolltoupper="scrollLeft"
              :show-scrollbar="false"
              @touchend="touchend"
              :scroll-left="scrollViewLeft"
              @scroll="scroll"
              :lower-threshold="leftDistance"
              @scrolltolower="scrollRight"
            >
              <canvas class="cvs" canvas-id="cvs-hreat" id="cvs-hreat"></canvas>
              <canvas class="cvs" canvas-id="cvs-fig" id="cvs-fig"></canvas>
            </scroll-view>
            <!--<view v-if="showHreat"></view>-->
            <view class="switch-btn-list">
              <view class="switch-btn" :class="{ 'switch-btn--select': showHreat }" @tap="switchShow(true)">心率</view>
              <view class="switch-btn" :class="{ 'switch-btn--select': !showHreat }" @tap="switchShow(false)">
                心电图
              </view>
            </view>
          </view>
        </view>
        <view class="extra-info">
          <view class="title">
            需要注意的风险
            <!--          <text @click="shuzichegnfa -= 100">-100</text>
          {{ shuzichegnfa }}
          <text @click="shuzichegnfa += 100">-100</text> -->
          </view>
          <view class="extra-info-list">
            <view
              class="extra-info-item"
              v-for="item in crisisShowDataList"
              :key="item.name"
              @click="showThisTips(item.name)"
              :style="{
                backgroundColor: item.value < 50 ? '#F8F8F8' : item.value < 80 ? '#FFE5BF' : '#FE8686',
                color: item.value < 80 ? '#000' : '#fff'
              }"
            >
              <view class="extra-info-item-title">
                <view class="" style="display: flex">
                  {{ item.title }}
                  <u-icon name="question-circle"></u-icon>
                </view>
                <view class="">
                  <u-icon name="arrow-right"></u-icon>
                </view>
              </view>
              <view class="extra-info-item-progress">
                <view
                  class="extra-info-item-progress-jd"
                  :style="{
                    width: item.value + '%',
                    backgroundColor:
                      item.value < 20 ? '#0c9' : item.value < 50 ? '#9e0' : item.value < 80 ? '#fc5' : '#f00'
                  }"
                ></view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="cv_list">
      <canvas
        class="cv_bg"
        ref="canvasEl"
        canvas-id="cv_bg"
        type="2d"
        id="cv_bg"
        :style="{ height: canvasHeight + 'px', width: cv_width + 'px' }"
      ></canvas>
      <canvas
        class="cv_item"
        canvas-id="cv"
        type="2d"
        id="cv"
        :style="{ height: canvasHeight + 'px', width: cv_width + 'px' }"
      ></canvas>
    </view>
  </view>
</template>

<script>
import { setOnDataParsed, getqiehuan, setzhuyes, setfuyes, setkaishijieshou } from '@/utils/new12ble';
import { mapState, mapMutations } from 'vuex';
import { getCurrentTimeFormatted, GUID } from '@/utils/comm.js';
import { DrawEcg, DrawHreat } from '../../components/xindraw12.js';
import { xindraw, clear, updateAndDrawEcg } from '../../components/xindraw12Re.js';
// import filterUtils from '../../components/new12daojisuan.js';
export default {
  data() {
    return {
      // shuzichegnfa: 100,
      timer: null,
      isSuccessful: false,
      newDataObj: {
        deviceSn: 'D4:DA:6E:1A:15:86',
        ts: 0
      },
      h5device: null,
      qiehuan: true,
      zijie: 1,

      guid: '',
      g_FourMinDataAry: [],

      // ====================================================================
      showw: false,
      pbm: '10rpx',
      show: false,
      setNav: {
        isdisPlayNavTitle: true,
        navTitle: '动态心电图'
      },
      showHreat: true,
      ctxFig: null,
      ctxHreat: null,
      crisisShowDataList: [
        {
          name: 'GengSi',
          title: '心肌梗塞',
          value: 0
        },
        {
          name: 'FangChan',
          title: '房颤/房扑',
          value: 0
        },
        {
          name: 'XSL_pr',
          title: '心室率过低',
          value: 0
        },
        {
          name: 'RRGC_pr',
          title: '长RR间期',
          value: 0
        },
        {
          name: 'XDGH_pr',
          title: '心动过缓',
          value: 0
        },
        {
          name: 'XDGS_pr',
          title: '心动过速',
          value: 0
        },
        {
          name: 'SX_XDGS_pr',
          title: '室性心动过速',
          value: 0
        },
        {
          name: 'shichan',
          title: '室颤室扑',
          value: 0
        },
        {
          name: 'duoshichuan',
          title: '窦室传导',
          value: 0
        },
        {
          name: 'QTc',
          title: 'QTc间期过长',
          value: 0
        }
      ],
      crisisShowData: {
        //心肌梗塞
        GengSi: 0,
        //房颤/房扑
        FangChan: 0,
        //心室率过低
        XSL_pr: 0,
        //长RR间期
        RRGC_pr: 0,
        //心动过缓
        XDGH_pr: 0,
        //心动过速
        XDGS_pr: 0,
        //室性心动过速
        SX_XDGS_pr: 0,
        //室颤室扑
        shichan: 0,
        //窦室传导
        duoshichuan: 0,
        //QTc间期过长
        QTc: 0,
        //心率
        hr_mean: 0,
        //SDNN
        SDNN: 0,
        //RMSSD
        rMSSD: 0,
        //NN20
        NN20: 0,
        //NN50
        NN50: 0,
        //pNN20
        PNN20: 0,
        //pNN50
        PNN50: 0
      },
      ecgShowLead: 'II',
      cvhObj: null,
      cveObj: null,
      leftDistance: 320,
      scrollViewLeft: 0,
      scrollViewLeftOld: 0,
      showTips: {
        GengSi:
          '心肌梗死：心肌梗死是一种严重的心血管疾病，常因冠状动脉阻塞导致心肌血液供应不足，使心肌部分区域缺血坏死，临床表现包括胸痛、呼吸困难、恶心等症状，严重者可导致心律失常、心力衰竭甚至猝死。治疗旨在尽快恢复血流，减少心肌损伤，包括药物治疗、冠状动脉搭桥术等方式。',
        FangChan:
          '房颤、房扑：房颤和房扑都是心脏节律异常的类型。房颤是心房不规则而快速地跳动，而房扑则是心房以更有规律的快速节律跳动。这两种情况都可能导致心脏泵血效率下降，增加血栓形成和中风风险。房颤和房扑的症状可能包括心悸、胸闷、乏力以及心率不规律，治疗方法通常包括药物控制心率、恢复正常心律或者手术干预。',
        XSL_pr:
          '心室率过低指的是心脏搏动频率较慢，通常低于正常范围，可能导致心脏泵血不足，引起头晕、乏力等症状，严重时可导致晕厥或心跳停止。',
        RRGC_pr:
          '长RR间期表示心跳之间的时间间隔超出了正常范围，可能是由于心脏传导系统的问题或其他心脏疾病所致，需要进一步评估。',
        XDGH_pr: '心动过缓是心跳过于缓慢，可能影响心脏有效泵血，导致头晕、疲劳等不适症状。',
        XDGS_pr: '心动过速是心跳过快，可能导致心脏负荷增加，表现为心悸、胸闷等不适感。',
        SX_XDGS_pr:
          '室性心动过速是一种心脏节律失常，由心室异位起搏点引发，可导致心跳加快、心慌等症状。室性心动过速的治疗可能包括药物、心脏电击（心脏复律）、导管手术或减缓较快心率并恢复心律的手术。',
        shichan: '室颤和室扑是严重的心脏节律异常，心室快速而不规则地跳动，可能导致血液不循环，是心脏骤停的常见原因。',
        duoshichuan:
          '窦室传导疾病病因主要是高血钾，血钾增高出现在肌肉无力甚至瘫痪形成。通常以下肢出现较多。多数系危重症患者，如抢救不及时可死于高钾血症及其引起的致死性心律失常。治疗和预防引起高钾血症的原发病是预防该症的关键。',
        QTc: 'QTc间期过长表示心脏去极化和复极化的时间延长，这一种病可能是先天的，也有可能是因为治疗其他心脏病的药物而引起的后天病症。治疗方面可使用药物治疗或是手术植入心脏整流去颤器。'
      },
      selectTips: 'GengSi',
      // 画12导===========================================
      context: {},
      ecgData: [],
      cv_width: 375,
      cv_height: 60, //每行的高度
      list: [],
      ecgType: 'DECG12SX'
    };
  },
  computed: {
    ...mapState({
      barUser: (state) => state.barUser,
      ble: (state) => state.ble
    }),
    canvasHeight() {
      return this.cv_height * 12;
    }
  },
  onLoad(options) {
    const system = uni.getSystemInfoSync();
    this.cv_width = system.windowWidth;
    this.cv_height = (this.cv_width / 25) * 4;
    console.log('width:', this.cv_width);
    console.log('height:', this.cv_height);
    let width = uni.getSystemInfoSync().windowWidth;
    this.leftDistance = (width / 750) * 320;
    this.leftDistance = Math.round(this.leftDistance);
    let info = uni.getSystemInfoSync();
    if (info.platform == 'android') {
      this.pbm = '40rpx';
    }
  },
  onShow() {
    this.guid = GUID();
  },

  mounted() {
    setkaishijieshou(true);
    // 心率
    this.ctxHreat = uni.createCanvasContext('cvs-hreat');
    this.cvhObj = new DrawHreat(this.ctxHreat, 640, 328, 0);
    // II导联
    this.ctxFig = uni.createCanvasContext('cvs-fig');
    this.cveObj = new DrawEcg(this.ctxFig, 640, 328, this.ecgType, this.ecgShowLead);
    // 注册回调，接收解析后的数据并上传
    setOnDataParsed((data) => {
      if (data) {
        this.uploadDataL_LTP(data);
      }
    });
    setzhuyes((data) => {
      if (data) {
        console.log('画II导联');
        this.cveObj?.drawEcg(data);
      }
    });
    setfuyes((data) => {
      if (data) {
        if (this.context) {
          console.log('触发一回画12导联');
          xindraw(this.context, this.canvasHeight / 12, data);
        }
      }
    });
  },
  //离开当前页面
  onUnload() {
    console.log('卸载了');
    setkaishijieshou(false);
    clear();
    this.clearTimmer();
    // 取消获取表格数据
    clearInterval(this.timer);
  },
  methods: {
    ...mapMutations({}),

    /**
     右上角返回图标
     */
    fanhui() {
      if (this.qiehuan) {
        uni.navigateBack({
          delta: 1 // 返回上一级页面
        });
      } else {
        this.clearTimmer();
        this.qiehuan = true;
        getqiehuan(this.qiehuan);
        this.$nextTick(() => {
          // 心率
          this.ctxHreat = uni.createCanvasContext('cvs-hreat');
          this.cvhObj = new DrawHreat(this.ctxHreat, 640, 328, 0);
          // II导联
          this.ctxFig = uni.createCanvasContext('cvs-fig');
          this.cveObj = new DrawEcg(this.ctxFig, 640, 328, this.ecgType, this.ecgShowLead);
        });
      }
    },
    /**
    获取数据表格数据其中有timer定时器setInterval
    @param {type}  
    */
    getshujus() {
      let that = this;
      return uni
        .request({
          header: { user: 'zzu', password: 'zzu123' },
          url: 'https://server.mindyard.cn:84/detect_decg',
          data: that.newDataObj,
          method: 'POST',
          timeout: 30000
        })
        .then((res) => {
          console.log('获取数据接口');
          console.log(res);
          if (res.statusCode === 200) {
            that.newDataObj.ts++;
            if (!that.isSuccessful) {
              // 第一次成功，改为10秒请求一次
              that.isSuccessful = true;
              clearInterval(that.timer);
              that.timer = setInterval(() => {
                that.getshujus();
              }, 10000);
            }
            that.setCrisisData(res.data.result);
          }
        })
        .catch((err) => {
          console.error('请求失败:', err);
          // uni.showToast({
          //   title: '网络异常，正在重试...',
          //   icon: 'none',
          //   duration: 3000
          // });
        });
    },

    // 上传数据
    uploadDataL_LTP(data) {
      console.log('触发上传数据');
      console.log(data[1].length);
      const newDataObj = {
        // patientName: this.barUser.name || uni.getStorageSync('userName'),
        // age: 18,
        // gender: this.barUser.sex == '男' ? true : false,
        // data,
        // sampleRate: 250,
        // id: this.guid,
        // ecgType: 'DECG12ZKY',
        // recordDate: new Date(),
        // deviceSn: this.bleDevs[0]?.deviceId || 'ZKMC ECG 12',
        // patient_phone: this.barUser.tel || uni.getStorageSync('tel'),
        // hospName: '测试医院'
        patientName: '黄文涛',
        age: 18,
        gender: true,
        data,
        sampleRate: 250,
        id: this.guid,
        ecgType: 'DECG12ZKY',
        recordDate: new Date(),
        deviceSn: 'ZKMC ECG 12',
        patient_phone: '17839753707',
        hospName: '测试医院'
      };
      console.log('12导', newDataObj);
      return uni
        .request({
          header: { user: 'zzu', password: 'zzu123' },
          url: 'https://server.mindyard.cn:84/get_json',
          data: newDataObj,
          method: 'POST',
          timeout: 30000
        })
        .then((res) => {
          console.log('返回值');
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
          // uni.showToast({
          //   title: '数据无法上传',
          //   icon: 'none',
          //   duration: 5000
          // });
        });
    },

    // --------------------------------------------
    open() {
      // console.log('open');
    },
    closed() {
      this.showw = false;
    },
    showThisTips(value) {
      this.selectTips = value;
      this.showw = true;
    },
    scroll(e) {
      this.scrollViewLeftOld = e.detail.scrollLeft;
    },
    touchend() {
      console.log('松开手');
      this.scrollViewLeft = this.scrollViewLeftOld;
      this.scrollViewLeftOld = 0;
      this.$nextTick(() => {
        if (this.showHreat) {
          this.scrollViewLeft = 0;
        } else {
          let width = uni.getSystemInfoSync().windowWidth;
          this.scrollViewLeft = (width / 750) * 640;
        }
      });
    },
    scrollLeft(e) {
      if (this.showHreat) return;
      this.showHreat = true;
      console.log('触发了切换到左边的事件');
    },
    scrollRight(e) {
      if (!this.showHreat) return;
      this.showHreat = false;
      console.log('触发了切换到右边的事件');
    },
    switchShow(val) {
      this.showHreat = val;
      this.$nextTick(() => {
        if (this.showHreat) {
          this.scrollViewLeft = 0;
        } else {
          let width = uni.getSystemInfoSync().windowWidth;
          this.scrollViewLeft = (width / 750) * 640;
        }
      });
    },
    /**
     * 设置心电图额外数据
     * @param data
     */
    setCrisisData(data) {
      let th = this;
      for (let key in th.crisisShowData) {
        th.crisisShowData[key] = data[key] ? (isNaN(data[key]) ? data[key] : Number(data[key])) : 0;
        th.crisisShowData[key] = parseInt(th.crisisShowData[key] * 100);
      }
      for (let key in th.crisisShowDataList) {
        th.crisisShowDataList[key].value = th.crisisShowData[th.crisisShowDataList[key].name];
      }
      th.crisisShowData.hr_mean = Math.round(th.crisisShowData.hr_mean / 100);
      th.crisisShowData.SDNN = Math.round(th.crisisShowData.SDNN / 100);
      th.crisisShowData.rMSSD = Math.round(th.crisisShowData.rMSSD / 100);
      th.crisisShowData.NN20 = Math.round(th.crisisShowData.NN20 / 100);
      th.crisisShowData.NN50 = Math.round(th.crisisShowData.NN50 / 100);
      th.crisisShowData.PNN20 = Math.round(th.crisisShowData.PNN20 / 100);
      th.crisisShowData.PNN50 = Math.round(th.crisisShowData.PNN50 / 100);
      console.log(th.crisisShowData.hr_mean);
      th.cvhObj.setValue(th.crisisShowData.hr_mean);
    },
    /**
    切换到新12导联副页面
    */
    openSwitchLead() {
      let th = this;
      this.clearTimmer();
      this.qiehuan = false;
      getqiehuan(this.qiehuan);
      try {
        this.$nextTick(() => {
          setTimeout(async () => {
            try {
              await this.getContextBg();
              this.drawPar(this.contextBg);
              await this.getContexts();
            } catch (e) {
              console.error('获取上下文时出错:', e);
            }
          }, 100);
        });
      } catch (e) {
        console.log('主页画II导联报错');
        console.log(e);
      }
    },
    /**
    返回到新12导主页面
    */
    backHome() {
      this.clearTimmer();
      this.qiehuan = true;
      getqiehuan(this.qiehuan);
      this.$nextTick(() => {
        // 心率
        this.ctxHreat = uni.createCanvasContext('cvs-hreat');
        this.cvhObj = new DrawHreat(this.ctxHreat, 640, 328, 0);
        // II导联
        this.ctxFig = uni.createCanvasContext('cvs-fig');
        this.cveObj = new DrawEcg(this.ctxFig, 640, 328, this.ecgType, this.ecgShowLead);
      });
    },
    /**
    取消定时器触发cveObj以及cvhObj中的clearTimer函数
    */
    clearTimmer() {
      this.cveObj?.clearTimer();
      this.cvhObj?.clearTimer();
    },
    // 画12导数据======================================================
    /**
    获取12导联实例
    */
    getContexts() {
      // #ifdef APP || H5
      this.context = uni.createCanvasContext('cv');
      // #endif
      // #ifdef MP-WEIXIN
      return new Promise((resolve) => {
        uni
          .createSelectorQuery()
          .in(this)
          .select('#cv')
          .fields({
            node: true,
            size: true
          })
          .exec((res) => {
            const canvas = res[0].node;
            const dpr = uni.getSystemInfoSync().pixelRatio;
            canvas.width = res[0].width * dpr;
            canvas.height = res[0].height * dpr;
            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);
            this.context = ctx;
            resolve(ctx);
          });
      });
      // #endif
    },
    /**
    获取12导联红框实例
    */
    getContextBg() {
      // #ifdef APP || H5
      this.contextBg = uni.createCanvasContext('cv_bg');
      // #endif
      // #ifdef MP-WEIXIN
      return new Promise((resolve) => {
        uni
          .createSelectorQuery()
          .in(this)
          .select('#cv_bg')
          .fields({
            node: true,
            size: true
          })
          .exec((res) => {
            const canvas = res[0].node;
            const dpr = uni.getSystemInfoSync().pixelRatio;
            canvas.width = res[0].width * dpr;
            console.log(` canvas.width为${canvas.width}`);
            canvas.height = res[0].height * dpr;
            console.log(` canvas.height为${canvas.height}`);
            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);
            this.contextBg = ctx;
            resolve(ctx);
          });
      });
      // #endif
    },
    /**
    绘制新12导联红框
    */
    drawPar(ctx) {
      //上面的绘制方式为uniapp的canvas绘制方式，下面的为原生的canvas绘制方式
      let lineColor = '#F2847F';
      for (let i = 0; i < 26; i++) {
        //设置颜色
        ctx.strokeStyle = lineColor;
        //虚线
        ctx.setLineDash([5, 7]);
        ctx.beginPath();
        ctx.moveTo((i * this.cv_width) / 25, 0);
        ctx.lineTo((i * this.cv_width) / 25, this.canvasHeight);
        ctx.closePath();
        ctx.stroke();
      }
      //设置线宽
      ctx.lineWidth = 1;
      //画线
      for (let i = 0; i < 12; i++) {
        //设置颜色
        ctx.strokeStyle = '#F2847F';
        //实线
        ctx.setLineDash([0, 0]);
        ctx.beginPath();
        ctx.moveTo(0, this.cv_height * (i + 1));
        ctx.lineTo(this.cv_width, this.cv_height * (i + 1));
        ctx.closePath();
        ctx.stroke();
        for (let j = 1; j <= 3; j++) {
          //设置颜色
          ctx.strokeStyle = lineColor;
          //虚线
          ctx.setLineDash([5, 3]);
          ctx.beginPath();
          ctx.moveTo(0, this.cv_height * (i + j * 0.25));
          ctx.lineTo(this.cv_width, this.cv_height * (i + j * 0.25));
          ctx.closePath();
          ctx.stroke();
        }
      }
      const arr12 = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];
      ctx.font = '12px Arial';
      ctx.fillStyle = '#06f';
      for (let i = 0; i < 12; i++) {
        ctx.fillText(arr12[i], 10, this.cv_height * (i + 1) - 10);
      }
      // 应用所有绘图操作到canvas上
      ctx.draw(true); // 清空画布并绘制新内容
    }
  }
};
</script>

<style>
page {
  background: linear-gradient(180deg, #d9fff1, #fff);
  background-repeat: no-repeat;
}
</style>
<style scoped>
view,
text {
  box-sizing: border-box;
}
</style>
<style lang="scss" scoped>
.shishishi {
  height: 100%;
  overflow-y: auto;
}
.anniukan {
  width: 92%;
  margin: 0 auto;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-around;
  view {
    background-color: #00ca99;
    color: #fff;
    border-radius: 35rpx;
    padding: 15rpx;
    text-align: center;
    width: 30%;
  }
}
.luang {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}
.btn-nav-box {
  z-index: 100 !important;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  .btn-nav {
    width: 24rpx;
    height: 36rpx;
  }
}
::v-deep ::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.hreat-box {
  width: 690rpx;
  height: 544rpx;
  margin-top: 30rpx;
  padding-top: 40rpx;
  margin-left: 30rpx;
  background-color: #fff;
  border-radius: 14rpx;
  position: relative;
}

.select-info {
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  overflow: hidden;

  &-btn {
    font-size: 26rpx;
    line-height: 22rpx;
    color: #cdcdcd;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}

.select-info-title-tips {
  font-size: 24rpx;
  color: #666;
}

.info-cv {
  height: 416rpx;
  width: 640rpx;
  margin-left: 24rpx;
  background-color: #f8f8f8;
  margin-top: 24rpx;
  border-radius: 14rpx;
  overflow: hidden;
  padding-top: 12rpx;
}

.cvs-box {
  display: flex;
  width: 640rpx;
  align-items: center;
  justify-content: center;
  height: 328rpx;
  overflow: hidden;
  white-space: nowrap;
}

.cvs {
  box-sizing: border-box;
  display: inline-block;
  width: 640rpx;
  height: 328rpx;
}

.switch-btn-list {
  display: flex;
  width: 260rpx;
  margin: auto;
  margin-top: 16rpx;
}

.switch-btn {
  width: 110rpx;
  border-radius: 16rpx;
  background-color: #fff;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.switch-btn:not(:first-child) {
  margin-left: 40rpx;
}

.switch-btn--select {
  background-color: #00ca99;
  color: #fff;
}

.extra-info {
  width: 92%;
  margin: 24rpx auto 30rpx auto;
  background-color: #fff;
  border-radius: 14rpx;
  position: relative;
  padding: 50rpx 26rpx 30rpx 26rpx;
  height: 50%;
  overflow-y: auto;
}

.extra-info-list {
  margin-top: 24rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  .extra-info-item {
    width: 316rpx;
    height: 178rpx;
    background-color: #f8f8f8;
    margin-bottom: 12rpx;
    padding-left: 18rpx;
    border-radius: 14rpx;

    &-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 18rpx;
      font-size: 30rpx;

      .iconfont {
        margin-left: 10rpx;
      }

      .icon-youjiantou {
        position: absolute;
        right: 10rpx;
        top: 4rpx;
      }
    }

    &-progress {
      margin-top: 82rpx;
      width: 284rpx;
      height: 22rpx;
      background-color: #f3f3f3;
      border-radius: 11rpx;

      &-jd {
        border-radius: 11rpx;
        min-width: 25rpx;
        width: 25rpx;
        height: 100%;
        background-color: #00ca99;
      }
    }
  }
}

.select-type {
  width: 400rpx;
  height: 600rpx;
}

.popup {
  border-radius: 16rpx;
  overflow: hidden;
}

.popup-tips {
  background-color: #fff;
  padding: 128rpx 40rpx 10rpx 60rpx;
  border-radius: 0 0 30rpx 30rpx;
  font-size: 30rpx;
  //首行文字空两个字
  text-indent: 2em;
  color: #313131;
}

.popup-safe {
  width: 100%;
  ///* 兼容旧版iOS */
  height: calc(env(safe-area-inset-bottom));
  background-color: #fff;
  position: absolute;
  bottom: -calc(env(safe-area-inset-bottom));
}

.select-type-btn {
  color: #00ca99;
}
</style>
<style scoped>
//同时选择uni-popup__wrapper和bottom
.vue-ref:has(.uni-popup__wrapper) {
  border-radius: 30rpx;
  overflow: hidden;
}
</style>
<style lang="scss" scoped>
.cv_list {
  background-color: #fff;
  overflow: scroll;
  position: relative;

  .cv_item {
    z-index: 99;
  }

  .cv_bg {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }
}
.lanya {
  width: 92%;
  background-color: pink;
  margin: 20rpx auto 0 auto;
  background-color: #fff;
  border-radius: 14rpx;
  padding: 20rpx;
  &_biaoti {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
.lianjeianniu {
  background-color: #0c9;
  color: #fff;
  padding: 10rpx;
  border-radius: 14rpx;
}
.tankuang {
  z-index: 10000 !important;
  width: 92%;
  background-color: #fff;
  padding: 18rpx;
  margin: 18rpx auto 18rpx auto;
  border-radius: 14rpx;
}
.shebeizhilan {
  margin-top: 20rpx;
  height: 400rpx;
  overflow-y: auto;
}
.shebei {
  width: 100%;
  background-color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx;
  margin-top: 18rpx;
  border-radius: 14rpx;
}
.shebei:first-child {
  margin-top: 0;
}
.biaotizhi {
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.quxiao {
  background-color: #f8f8f8;
  color: #000;
  padding: 10rpx;
  border-radius: 14rpx;
}
</style>
