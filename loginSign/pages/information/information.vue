<template>
  <view class="page">
    <u-navbar title="注册" bgColor="#fff" :placeholder="true"></u-navbar>
    <view class="" v-if="diyici">
      <view class="xinkuang shangxia">
        <view class="hi">Hi ~</view>
        <view class="zhuique">为了您的测量数据更精准</view>
        <view class="zhuique">请填写以下信息</view>
      </view>
      <view class="zhuti">
        <!-- 姓名 -->
        <view class="shurukuangzuti">
          <input
            type="text"
            placeholder="请输入姓名"
            class="input-code input-codezhi"
            :class="{ hongxi: yonghuname }"
            v-model="name"
            placeholder-class="font"
          />
        </view>
        <!-- 出生日期 -->
        <view class="shurukuangzuti">
          <view class="list-item" style="width: 95%; margin: auto" @click="bindDateChange">
            <text class="font" :class="{ hongxi: star1 }">出生日期</text>
            <picker
              mode="date"
              :value="date"
              :start="startDate"
              :end="endDate"
              @change="bindDateChange"
              @cancel="riqiquxiao"
              style="flex: 1"
            >
              <view class="flex" style="display: flex; justify-content: flex-end; align-items: center">
                <view class="uni-input">{{ date }}</view>
                <u-icon name="arrow-right" size="16" color="#000"></u-icon>
              </view>
            </picker>
          </view>
        </view>
        <!-- 性别 -->
        <view class="shurukuangzuti">
          <view
            class="sex"
            style="
              display: flex;
              border: none;
              justify-content: space-between;
              width: 95%;
              margin: 0 auto;
              padding-left: 0;
            "
          >
            <text class="font" style="padding-left: 20rpx">性别</text>
            <radio-group @change="radioChange" style="flex: 1; display: flex; justify-content: flex-end">
              <label
                class="uni-list-cell uni-list-cell-pd"
                v-for="(item, index) in items"
                :key="item.value"
                style="display: inline-flex; margin-right: 40rpx"
              >
                <view>
                  <radio :value="item.value" :checked="index === current" />
                </view>
                <view>{{ item.name }}</view>
              </label>
            </radio-group>
          </view>
        </view>
        <!-- 身高体重 -->
        <view class="content" style="margin: 0 0 25rpx 0; border: 2rpx solid #00d4d0">
          <view class="list-item" style="width: 95%; margin: 0 auto">
            <text class="font">身高</text>
            <picker mode="selector" @change="bindMultiPickerColumnChange" :value="multiIndex" :range="array">
              <view class="flex" style="display: flex; justify-content: flex-end; align-items: center">
                <view class="uni-input">{{ num }}cm</view>
                <u-icon name="arrow-right" size="16" color="#000"></u-icon>
              </view>
            </picker>
          </view>
          <view class="list-item" style="width: 95%; margin: 0 auto">
            <text class="font">体重</text>
            <picker mode="selector" @change="bindMultiPickerColumnChange1" :value="multiIndex1" :range="array1">
              <view class="flex" style="display: flex; justify-content: flex-end; align-items: center">
                <view class="uni-input">{{ num1 }}kg</view>
                <u-icon name="arrow-right" size="16" color="#000"></u-icon>
              </view>
            </picker>
          </view>
        </view>
        <!-- 所属医院 -->
        <view class="shurukuangzuti">
          <view
            class="list-item"
            style="width: 95%; margin: 0 auto; height: 70rpx; line-height: 70rpx; font-weight: 700"
          >
            所属医院
          </view>
          <view class="isolation"></view>
          <button
            class="select-item"
            style="width: 95%; margin: 0 auto; border-radius: 0 0 25rpx 25rpx; padding: 0 20rpx"
          >
            <view>{{ selectHospital || '请选择医院' }}</view>
          </button>
        </view>
        <view class="shurukuangzuti" style="padding: 20rpx 10rpx; background-color: #00d4d0">
          <view class="" style="color: #fff; font-size: 40rpx; font-weight: 700; text-align: center" @click="xiayibu">
            下一步
          </view>
        </view>
      </view>
    </view>
    <view v-else style="height: 82vh; overflow-y: auto">
      <view style="width: 95%; margin: 10rpx auto">
        <view style="font-size: 40rpx; letter-spacing: 3rpx">请选择符合自己情况的选项(多选)</view>
      </view>
      <!-- 过往病史 -->
      <view class="lists">
        <text>过往病史</text>

        <checkbox-group style="display: flex; flex-wrap: wrap; justify-content: space-between" @change="checkboxChange">
          <label class="uni-list-cell" @click="toggle" :class="{ active: check1 == true }">无</label>
          <label
            v-for="item in bz"
            :key="item.medicalDataId"
            :class="{ active: item.checked == true }"
            class="uni-list-cell"
          >
            <view>
              <checkbox :checked="item.checked" :value="String(item.medicalDataId)" />
            </view>
            <view>{{ item.medicalName }}</view>
          </label>
        </checkbox-group>
      </view>
      <!-- 生活习惯 -->
      <view class="lists">
        <text>生活习惯</text>

        <checkbox-group
          style="display: flex; flex-wrap: wrap; justify-content: space-between"
          @change="checkboxChange1"
        >
          <label class="uni-list-cell" @click="toggle1" :class="{ active: check2 == true }">无</label>
          <label v-for="item in xg" :key="item.value" :class="{ active: item.checked == true }" class="uni-list-cell">
            <view>
              <checkbox :checked="item.checked" :value="item.value" />
            </view>
            <view>{{ item.name }}</view>
          </label>
        </checkbox-group>
      </view>
      <view style="width: 95%; margin: 10rpx auto">
        <view class="fonts">您的完善的个人信息将帮着我们为您提供更精准的健康提醒及建议</view>
        <view style="height: 30rpx"></view>
      </view>
      <view class="tiaoguowancheng">
        <view class="tiaoguowancheng-lan">
          <view class="btn" @tap="login(true)">跳过</view>
          <view class="btn" @tap="login(true)">完成</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// import { throttleNavigate } from '@/wlsdk/showModule.js';
import { getUserInfo, addMedicalHistory, getDisease, register } from '@/api/loginSign/index.js';
import { mapMutations } from 'vuex';
export default {
  data() {
    const defaultDate = this.getDate('jian');
    return {
      // 显示第一张
      diyici: true,
      // 姓名加红星
      yonghuname: true,
      star: true,
      star1: true,
      star2: true,
      star3: true,
      emergencyObj: {
        name: '',
        phone: ''
      },
      selectHospital: '河南省心电学诊疗中心',
      check1: '',
      date: defaultDate,
      multiIndex: 160,
      multiIndex1: 50,
      sex: '男',
      name: '',
      tel: '',
      bz: [],
      medical: '',
      accust: '',
      age: '',
      check2: '',
      index1: null,
      index2: null,
      index: 0,
      array: [],
      array1: [],
      num: '',
      num1: '',
      xg: [
        {
          value: '喝酒',
          name: '喝酒'
        },

        {
          value: '熬夜',
          name: '熬夜'
        },
        {
          value: '抽烟',
          name: '抽烟'
        }
      ],

      items: [
        {
          value: '1',
          name: '男',
          checked: 'true'
        },
        {
          value: '0',
          name: '女'
        }
      ],
      current: 0,
      setNav: {
        isdisPlayNavTitle: true,
        navTitle: '注册' //导航标题
      }
    };
  },
  onLoad(options) {
    console.log(options);
    for (let j = 0; j < 240; j = j + 1) {
      this.array.push(j);
    }

    for (let i = 0; i <= 200; i = i + 1) {
      this.array1.push(i);
    }

    this.num = this.array[this.multiIndex];
    this.num1 = this.array1[this.multiIndex1];

    this.tel = uni.getStorageSync('tel');
    console.log(this.tel);
    // this.array1.unshift('40kg以下')
    // this.array1.push('120kg以上')
    this.getlist();
  },
  onShow() {},
  onUnload() {},
  computed: {
    startDate() {
      let start = this.getDate('start');
      console.log('开始:', start); // 打印 startDate
      return start;
    },
    endDate() {
      const end = this.getDate('end');
      console.log('结束:', end); // 打印 endDate
      return end;
    }
  },
  watch: {
    name: function (newValue) {
      this.yonghuname = !newValue; // 如果有值则为 false
    },
    date: {
      handler(value) {
        this.star1 = !value ? true : false;
      }
    },
    num: {
      handler(value) {
        this.star2 = !value ? true : false;
      }
    },
    num1: {
      handler(value) {
        this.star3 = !value ? true : false;
      }
    }
  },
  methods: {
    ...mapMutations({
      setBarUser: 'SET_BAR_USER'
    }),
    riqiquxiao() {
      console.log('点击了遮罩层或取消');
      this.date = '请选择';
    },
    xiayibu() {
      if (!this.name) {
        uni.showToast({
          title: '请先填写姓名',
          icon: 'error',
          duration: 2000
        });
        return;
      }
      if (this.date === '请选择') {
        uni.showToast({
          title: '请填写出生年月',
          icon: 'error',
          duration: 2000
        });
        return;
      }
      this.login();
      this.diyici = false;
    },
    choosePeople(i) {
      const vuePro = this;
      // 在需要打开系统通讯录界面的地方调用如下代码
      uni.chooseContact({
        success: function (res) {
          console.log('选择的联系人信息：', res);
          if (i == 1) {
            vuePro.emergencyObj.name = res.displayName;
            vuePro.emergencyObj.phone = res.phoneNumber;
          } else if (i == 2) {
            vuePro.emergencyObj1.name = res.displayName;
            vuePro.emergencyObj1.phone = res.phoneNumber;
          }
        },
        fail: function (err) {
          console.error('打开系统通讯录界面失败：', err);
        }
      });
    },
    bindMultiPickerColumnChange: function (e) {
      this.multiIndex = e.detail.value;
      this.num = this.array[e.detail.value];
      this.$forceUpdate();
    },
    bindMultiPickerColumnChange1: function (e) {
      this.multiIndex1 = e.detail.value;
      this.num1 = this.array1[e.detail.value];
      this.$forceUpdate();
    },

    toggle() {
      this.check1 = !this.check1;
      var items = this.bz;
      if (this.check1) {
        for (var i = 0, lenI = items.length; i < lenI; ++i) {
          const item = items[i];
          this.$set(item, 'checked', false);
        }
        this.medical = '无';
        console.log(this.medical);
      }
    },
    toggle1() {
      this.check2 = !this.check2;
      var items = this.xg;
      if (this.check2) {
        for (var i = 0, lenI = items.length; i < lenI; ++i) {
          const item = items[i];
          this.$set(item, 'checked', false);
        }
        this.accust = '无';
      }
    },
    getlist() {
      getDisease({ pageSize: 100, pageNum: 1 })
        .then((res) => {
          this.bz = res.data.rows;
          console.log(typeof this.bz[0]);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    checkboxChange1: function (e) {
      var arr = [];
      var items = this.xg,
        values = e.detail.value;
      for (var i = 0, lenI = items.length; i < lenI; ++i) {
        const item = items[i];

        if (values.includes(item.value)) {
          this.$set(item, 'checked', true);
        } else {
          this.$set(item, 'checked', false);
        }

        if (items[i].checked) {
          this.check2 = false;
        }

        if (item.checked == true) {
          arr.push(item.value);
        }
      }

      this.accust = arr.toString();
      console.log(this.accust);
    },
    checkboxChange: function (e) {
      var items = this.bz,
        values = e.detail.value;
      var arr = [];
      for (var i = 0, lenI = items.length; i < lenI; ++i) {
        const item = items[i];

        var a = String(item.medicalDataId);

        if (values.includes(a)) {
          this.$set(item, 'checked', true);
        } else {
          this.$set(item, 'checked', false);
        }

        if (item.checked == true) {
          arr.push(item.medicalDataId);
        }

        if (items[i].checked) {
          this.check1 = false;
        }
      }

      this.medical = arr.toString();
      console.log(this.medical);
    },
    bindPickerChange: function (e) {
      this.index2 = e.detail.value;
      console.log(e.detail.value, this.index2);
    },
    bindPickerChange1: function (e) {
      console.log(e);
      console.log('picker发送选择改变，携带值为', e.detail.value);
      this.index1 = e.detail.value;
    },
    bindDateChange: function (e) {
      console.log(e);
      this.date = e.detail.value;
    },
    radioChange: function (e) {
      this.sex = e.detail.value;
      console.log('性别:', this.sex);
    },
    login(tiem = false) {
      var rules = /^1[3456789]\d{9}$/;
      if (!this.name) {
        uni.showToast({
          title: '请输入姓名',
          icon: 'none'
        });
        return;
      }

      if (this.date == '请选择') {
        uni.showToast({
          title: '请选择出生日期',
          icon: 'none'
        });
        return;
      }

      if (!this.accust) {
        this.accust = '无';
      }
      if (!this.medical) {
        this.medical = '无';
      }
      if (this.sex == '0' || this.sex == '女') {
        this.sex = '女';
      } else {
        this.sex = '男';
      }
      if (this.selectHospital == '') {
        uni.showToast({
          title: '请选择医院',
          icon: 'none'
        });
        return;
        // this.selectHospital = '河南省心电学诊疗中心'
      }
      if (tiem) {
        uni.showLoading({
          title: '上传中',
          mask: true
        });
      }

      console.log('点击注册完成');
      this.getform1(tiem);
      console.log('form1完成结果：', this.sex, this.num, this.num1, this.tel, this.accust, this.medical);
    },

    getform1(tiem) {
      uni.hideLoading();
      register({
        userName: this.tel,
        patientPhone: this.tel,
        patientName: this.name,
        patientSex: this.sex,
        patientAge: this.age,
        birthDay: this.date,
        hospital: this.selectHospital
      })
        .then((res) => {
          if (res.data.code == 200) {
            this.getform2(tiem);
          } else {
            uni.showToast({
              //title: res.data.msg,
              title: '网络出错，请重试',
              icon: 'none'
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    goSeHp() {
      let url = '/pageOther/pages/modify/hospital';
      uni.navigateTo({
        url: url
      });
      // throttleNavigate(url);
    },
    getform2(tiem) {
      let th = this;
      addMedicalHistory({
        height: parseFloat(this.num),
        weight: parseFloat(this.num1),
        pastMedicalHistory: this.medical,
        livingHabit: this.accust,
        patientPhone: this.tel
      })
        .then((res) => {
          if (uni.getStorageSync('token')) {
            if (tiem) {
              th.getpersonalInformation();
              setTimeout(() => {
                uni.hideLoading();
                uni.showToast({
                  title: '注册成功',
                  icon: 'none'
                });
                if (this.youhui) {
                  uni.navigateBack({
                    delta: 2
                  });
                } else {
                  uni.switchTab({
                    url: '/pages/index/index'
                  });
                }
              }, 2000);
            }
          } else {
            uni.showToast({
              title: '网络出错，请重试1',
              icon: 'none'
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getpersonalInformation() {
      let th = this;
      getUserInfo(uni.getStorageSync('tel'))
        .then((res) => {
          if (res.data.code == 200) {
            console.log('患者info: ', res.data.data);
            let user = {
              name: res.data.data.userName,
              tel: res.data.data.patientPhone,
              sex: res.data.data.gender,
              hospName: res.data.data.hospital || '郑大',
              height: res.data.data.height,
              weight: res.data.data.weight,
              age: th.calculateAgeRealTime(res.data.data.birthDay)
            };
            th.setBarUser(user);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    calculateAgeRealTime(birthDateString) {
      const birthDate = new Date(birthDateString);
      const today = new Date(); // 使用当前系统时间

      let age = today.getFullYear() - birthDate.getFullYear();

      const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

      if (today < birthdayThisYear) {
        age--;
      }

      return age;
    },
    getDate(type) {
      const date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();

      if (type === 'start') {
        year = year - 120;
      } else if (type === 'end') {
        year = year + 2;
      } else if (type === 'jian') {
        year = year - 20;
      }
      // 格式化日期
      return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    }
  }
};
</script>

<style scoped lang="scss">
.flex {
  ::v-deep .u-icon__icon {
    margin-top: 8rpx;
  }
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

$fontSize: 34rpx;

page {
  background: #fafafa;
  padding-bottom: 80rpx;
}
.hongxi::before {
  content: '*';
  color: red;
  display: inline-block;
  position: absolute;
  left: 0;
  // top: 50%;
  // transform: translateY(-50%);
  pointer-events: none; /* 防止伪元素影响输入框的点击事件 */
}
.input-code {
  position: relative;
  // padding-left: 20px; /* 给输入框留出空间 */
}
.bixu {
  position: relative;
}

.bixu::before {
  content: '*';
  color: red;
  position: absolute;
  top: 0;
  left: 0;
  font-size: 30rpx;
  transform: translateX(-1em);
}

.fonts {
  font-size: $fontSize;
  margin: 20rpx 0 60rpx;
  color: #c4c4c4;
  text-align: center;
}

.lists .uni-list-cell {
  width: 45%;
  // height: 60rpx;
  padding: 10rpx;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 30rpx;
  font-size: $fontSize;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #333333;
  box-sizing: border-box;
  margin: 0 12rpx 14rpx 0;
}

.lists .uni-list-cell.active {
  background: linear-gradient(90deg, #00d6dc 0%, #00ca99 100%);
  color: #fff;
}

.lists .uni-list-cell:nth-of-type(3n) {
  margin-right: 0;
}

.lists checkbox {
  opacity: 0;
  width: 1px;
  height: 1px;
}

.lists {
  margin: 0 30rpx 20rpx;
}

.lists > text {
  font-size: $fontSize;
  display: block;
  margin-bottom: 30rpx;
  color: #999999;
}

.content {
  margin: 40rpx 30rpx;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 15rpx;
}

.input-code,
.list-item,
.sex {
  line-height: 100rpx;
  height: 100rpx;
  width: 90%;
  margin: 0 auto;
  font-size: $fontSize;
  padding-left: 20rpx;
  color: #333333;
  position: relative;
  border-bottom: 1px solid rgba(221, 221, 221, 0.4);
}

.list-item picker {
  width: 60%;
  text-align: right;
  padding-right: 40rpx;
}

.list-item image {
  position: absolute;
  top: 40rpx;
  right: 20rpx;
}

.font {
  color: #808080;
}

.list-item {
  display: flex;
  justify-content: space-between;
}

.xy {
  font-size: $fontSize;
  margin: 40rpx 30rpx 100rpx;
  color: #666666;
  display: flex;
}

.xy navigator {
  color: rgba(24, 181, 234, 1);
}
.tiaoguowancheng {
  position: fixed;
  bottom: 20rpx;
  width: 100vw;
}
.tiaoguowancheng-lan {
  display: flex;
  width: 100%;
  justify-content: space-around;
}
.btn {
  width: 300rpx;
  // margin: 0 30rpx;
  height: 90rpx;
  background: linear-gradient(-84deg, #00d6dc, #00ca99);
  border-radius: 45rpx;
  font-size: $fontSize;
  line-height: 90rpx;
  color: #ffffff;
  text-align: center;
}

.list-item {
  align-items: center;
  text-align: left;
}

.isolation {
  height: 1rpx;
  background: #d5d5d5;
  margin: 0 30rpx;
}

.select-item {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  padding: 0 54rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  -webkit-tap-highlight-color: transparent;
  background-color: rgb(255, 255, 255);
  box-sizing: border-box;
  color: #424242;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  overflow: hidden;
  position: relative;
  text-decoration: none;
}

.select-item::after {
  border: none;
}
</style>
<style lang="scss" scoped>
.xinkuang {
  width: 91%;
  margin: 0 auto;
}
.shangxia {
  width: 91%;
  margin: 25rpx auto 10rpx auto;
}
.zhuti {
  width: 91%;
  margin: 25rpx auto 10rpx auto;
}
.hi {
  font-size: 50rpx;
  font-weight: 700;
  letter-spacing: 7rpx;
}
.zhuique {
  font-size: 40rpx;
}
.shurukuangzuti {
  border: 2rpx solid #00d4d0;
  box-sizing: border-box;
  border-radius: 25rpx;
  background-color: #fff;
  margin-bottom: 25rpx;
}
.input-codezhi {
  box-sizing: border-box;

  width: 95%;
  margin: 0 auto;
}
</style>
