<template>
  <view class="zhuti">
    <view>
      <view class="contents boxShadow">
        <view class="list">
          <input
            type="text"
            placeholder="用户姓名"
            class="input-code"
            :class="{ hongxi: yonghuname }"
            v-model="formData.userName"
            placeholder-class="font"
          />
          <view class="list">
            <input
              type="number"
              placeholder="年龄"
              class="input-code"
              v-model="age"
              :class="{ hongxi: yonghuage }"
              placeholder-class="font"
            />
          </view>
          <view class="list">
            <input
              type="number"
              placeholder="用户手机号"
              class="input-code"
              v-model="formData.phone"
              :class="{ hongxi: yonghuphone }"
              placeholder-class="font"
            />
          </view>
          <view class="sex" style="display: flex; justify-content: space-between">
            <text class="font">性别</text>
            <radio-group @change="radioChange" style="width: 40%; display: flex">
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
          <view class="list-item">
            <text class="font">身高</text>
            <picker mode="selector" @change="bindMultiPickerColumnChange" :value="multiIndex" :range="array">
              <view class="uni-input">
                {{ num }}cm
                <u-icon name="arrow-right"></u-icon>
              </view>
            </picker>
          </view>
          <view class="list-item" style="border: none">
            <text class="font">体重</text>
            <picker mode="selector" @change="bindMultiPickerColumnChange1" :value="multiIndex1" :range="array1">
              <view class="uni-input">
                {{ num1 }}kg
                <u-icon name="arrow-right"></u-icon>
              </view>
            </picker>
          </view>
        </view>
      </view>
    </view>

    <!-- <view class="btn boxShadow" @tap="clickOk()">开始检测</view> -->
    <view class="btn boxShadow" @tap="startTest()">开始检测</view>
  </view>
</template>

<script>
import { inquireUser, addMedicalHistory, register, eegPatientAdd } from '@/api/loginSign/index.js';
export default {
  data() {
    return {
      //关系信息
      formData: {
        phone: '',
        userName: '',
        patientSex: '男',
        birthDay: '',
        height: '160',
        weight: '55'
      },
      age: '',
      array: [],
      array1: [],
      num: '160',
      num1: '55',
      multiIndex: 110,
      multiIndex1: 54,
      items: [
        {
          value: '男',
          name: '男',
          checked: 'true'
        },
        {
          value: '女',
          name: '女'
        }
      ],
      current: 0,
      // 姓名加红星
      yonghuname: true,
      // 年龄加红星
      yonghuage: true,
      // 姓名加红星
      yonghuphone: true
    };
  },
  onLoad(options) {
    for (let j = 50; j < 240; j = j + 1) {
      this.array.push(j);
    }

    for (let i = 1; i <= 200; i = i + 1) {
      this.array1.push(i);
    }
  },
  computed: {
    hasError() {
      return !this.formData.userName || this.focused;
    }
  },
  watch: {
    'formData.userName': function (newValue) {
      this.yonghuname = !newValue; // 如果有值则为 false
    },
    'formData.phone': function (newValue) {
      this.yonghuphone = !newValue; // 如果有值则为 false
    },
    age(val) {
      this.formData.birthDay = this.calculateBirthDate(val * 1);
      this.yonghuage = val * 1;
    }
  },
  onShow() {},
  onUnload() {},
  methods: {
    calculateBirthDate(age) {
      // 获取当前年份
      const currentYear = new Date().getFullYear();

      // 计算出生年份
      const birthYear = currentYear - age;

      // 创建出生日期对象（设置为12月31日）
      const birthDate = new Date(birthYear, 11, 31, 16, 0, 0, 2);

      // 返回ISO格式的日期字符串
      return birthDate.toISOString();
    },

    handleFocus() {
      this.focused = true;
    },
    handleBlur() {
      this.focused = false;
    },
    //获取时间
    getDate(type) {
      const date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();

      if (type === 'start') {
        year = year - 60;
      } else if (type === 'end') {
        year = year + 2;
      }
      month = month > 9 ? month : '0' + month;
      day = day > 9 ? day : '0' + day;
      return `${year}-01-01`;
    },
    //身高选择
    bindMultiPickerColumnChange: function (e) {
      this.multiIndexNum = e.detail.value;
      this.num = this.array[e.detail.value];
      this.formData.height = this.num;
      this.$forceUpdate();
    },
    // 体重选择
    bindMultiPickerColumnChange1: function (e) {
      this.multiIndexNum1 = e.detail.value;
      this.num1 = this.array1[e.detail.value];
      this.formData.weight = this.num1;
      this.$forceUpdate();
    },

    //性别选择
    radioChange: function (e) {
      console.log(e.detail.value);
      this.formData.patientSex = e.detail.value;
    },
    clickOk() {
      if (!this.formData.phone) {
        return uni.showToast({
          title: '手机号必填',
          icon: 'none'
        });
      }
      if (!this.formData.userName) {
        return uni.showToast({
          title: '姓名必填',
          icon: 'none'
        });
      }
      if (!this.formData.birthDay) {
        return uni.showToast({
          title: '年龄必填',
          icon: 'none'
        });
      }
      this.phoneVerify();
    },
    noPhone() {
      if (!this.formData.userName) {
        return uni.showToast({
          title: '姓名必填',
          icon: 'none'
        });
      }
      console.log(this.age);
      console.log(this.formData.birthDay);
      let date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let a = year - 0 + '-01-01';
      console.log(a);
      console.log(this.formData.birthDay == a);
      if (this.formData.birthDay == a || !this.formData.birthDay) {
        return uni.showToast({
          title: '年龄必填',
          icon: 'none'
        });
      }
      let th = this;
      console.log('记录信息');
    },
    //验证手机号是否正确及是否被注册
    phoneVerify() {
      uni.showLoading({
        title: '加载中'
      });
      let yz = /^(?:(?:\+|00)86)?1\d{10}$/;
      let th = this;
      console.log(this.formData.phone);
      if (!yz.test(th.formData.phone)) {
        return uni.showToast(
          {
            title: '手机号格式不正确',
            icon: 'none'
          },
          1000
        );
      } else {
        th.formRuleAll();
      }
    },
    formRuleAll() {
      let th = this;
      for (const item in th.formData) {
        if (Object.hasOwnProperty.call(th.formData, item)) {
          const element = th.formData[item];
          console.log(item + ':' + element);
          if (element == null || element == undefined || element == '') {
            uni.hideLoading();
            return uni.showToast({
              title: '有信息未填写',
              icon: 'none'
            });
          }
        }
      }
      th.addPatient();
    },

    addPatient() {
      let th = this;
      eegPatientAdd({
        patientAge: this.age * 1,
        patientPhone: this.formData.phone,
        patientName: this.formData.userName,
        patientSex: this.formData.patientSex,
        birthDate: this.formData.birthDay
      })
        .then((res) => {
          console.log('注册用户', res);
          if (res.data.code === 200) {
            th.startTest();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    //开始测试
    startTest() {
      uni.navigateTo({
        url: '/ecg/pages/index/index'
      });
    }
  }
};
</script>

<style scoped lang="scss">
page {
  padding-top: 25rpx;
}
.zhuti {
  height: 100%;
  width: 95%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;

  justify-content: space-between;
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
.page {
  background-color: pink;
  height: 100%;
}

.lists .uni-list-cell {
  width: 220rpx;
  height: 60rpx;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 30rpx;
  font-size: 24rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #333333;
  box-sizing: border-box;
  margin: 0 12rpx 14rpx 0;
}

.lists .uni-list-cell.active {
  // background: linear-gradient(90deg, #00D6DC 0%, #27A2F2 100%);
  background-color: #57e1c7;
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
  font-size: 30rpx;
  display: block;
  margin-bottom: 30rpx;
  color: #999999;
}

.contents {
  width: 95%;
  margin: 0 auto 25rpx auto;
  // margin: 20rpx 30rpx;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 15rpx;
  box-sizing: border-box;
}

.input-code,
.list-item,
.sex {
  line-height: 100rpx;
  height: 100rpx;
  width: 90%;
  margin: 0 auto;
  font-size: 30rpx;
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
  color: #c4c4c4;
}

.list-item {
  display: flex;
  justify-content: space-between;
}

.xy {
  font-size: 20rpx;
  margin: 40rpx 30rpx 100rpx;
  color: #666666;
  display: flex;
}

.xy navigator {
  color: rgba(24, 181, 234, 1);
}

.btn {
  background-color: #3699ec;
  border-radius: 45rpx;
  width: 100%;
  color: #fff;
  display: flex;
  justify-content: center;
  padding: 25rpx;
  box-sizing: border-box;
  align-items: center;
  margin-bottom: 25rpx;
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

.uni-input {
  display: flex;
  justify-content: flex-end;
}
</style>
