<template>
  <view class="page">
    <view class="content card">
      <view class="list">
        <input
          type="text"
          placeholder="姓名"
          class="input-code"
          :class="{ hongxi: yonghuname }"
          v-model="name"
          placeholder-class="font"
        />
        <view class="list-item">
          <view class="">
            <text v-if="star1" class="requireStyle">*</text>
            <text class="font">出生日期</text>
          </view>
          <picker mode="date" :value="date" :end="endDate" @change="bindDateChange">
            <view class="flex" style="display: flex; justify-content: flex-end">
              <view class="uni-input">{{ date }}</view>
              <u-icon name="arrow-right" color="#909399" size="18"></u-icon>
            </view>
          </picker>
        </view>

        <view class="sex" style="display: flex; justify-content: space-between">
          <text class="font">性别</text>
          <radio-group @change="radioChange" style="display: flex">
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
          <view class="">
            <text v-if="star2" class="requireStyle">*</text>
            <text class="font">身高</text>
          </view>
          <picker mode="selector" @change="bindMultiPickerColumnChange" :value="multiIndex" :range="array">
            <view class="flex" style="display: flex; justify-content: flex-end">
              <view class="uni-input">{{ num }}cm</view>
              <u-icon name="arrow-right" color="#909399" size="18"></u-icon>
            </view>
          </picker>
        </view>
        <view class="list-item">
          <view class="">
            <text v-if="star3" class="requireStyle">*</text>
            <text class="font">体重</text>
          </view>
          <picker mode="selector" @change="bindMultiPickerColumnChange1" :value="multiIndex1" :range="array1">
            <view class="flex" style="display: flex; justify-content: flex-end">
              <view class="uni-input">{{ num1 }}kg</view>
              <u-icon name="arrow-right" color="#909399" size="18"></u-icon>
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 绑定医院 -->
    <!--  <view class="content card">
      <view class="list-item" style="border: none; font-weight: 700; padding: 15rpx 0">所属医院</view>
      <view class="isolation"></view>
      <button class="select-item" @click="goSeHp">
        <view>{{ selectHospital || '请选择医院' }}</view>
      </button>
    </view> -->

    <view class="lists">
      <view class="m20 card">
        <MySection title="过往病史" :borderRadius="15"></MySection>
      </view>
      <u-read-more
        ref="uReadMore"
        :showHeight="130"
        :toggle="true"
        textIndent="0em"
        openText="收起"
        closeText="展开查看更多"
        color="#00ca99"
      >
        <checkbox-group style="display: flex; flex-wrap: wrap; justify-content: space-between" @change="checkboxChange">
          <label class="card uni-list-cell" @click="toggle" :class="{ active: check1 == true }">无</label>
          <label
            v-for="item in bz"
            :key="item.medicalDataId"
            :class="{ active: item.checked == true }"
            class="card uni-list-cell"
          >
            <view>
              <checkbox :checked="item.checked" :value="String(item.medicalDataId)" />
            </view>
            <view>{{ item.medicalName }}</view>
          </label>
        </checkbox-group>
      </u-read-more>
    </view>
    <view class="lists">
      <view class="m20 card">
        <MySection title="生活习惯" :borderRadius="15"></MySection>
      </view>

      <checkbox-group style="display: flex; flex-wrap: wrap; justify-content: space-between" @change="checkboxChange1">
        <label class="card uni-list-cell" @click="toggle1" :class="{ active: check2 == true }">无</label>
        <label
          v-for="item in xg"
          :key="item.value"
          :class="{ active: item.checked == true }"
          class="card uni-list-cell"
        >
          <view>
            <checkbox :checked="item.checked" :value="item.value" />
          </view>
          <view>{{ item.name }}</view>
        </label>
      </checkbox-group>
    </view>

    <view class="fonts">完善信息能让我们为您提供更精准的健康提醒及建议</view>

    <view class="btn card" @click="getform2">完成</view>
    <view style="height: 30rpx"></view>
  </view>
</template>

<script>
import { mapMutations } from 'vuex';
// import { throttleNavigate } from '@/wlsdk/showModule.js';
import { getUserInfo, getDisease, updateUserInfo } from '@/api/loginSign/index.js';
import { getCurrentDate } from '@/utils/common.js';
import MySection from '@/components/mySection.vue';
export default {
  components: {
    MySection
  },
  data() {
    const currentDate = this.getDate({
      format: true
    });
    return {
      // 姓名加红星
      yonghuname: true,
      endDate: '',
      selectHospital: '',
      star: true,
      star1: true,
      star2: true,
      star3: true,
      // 用户修改家人信息
      familyPhone: '',
      // 紧急联系人方式
      emergencyObj: {
        name: '',
        phone: ''
      },
      // emergencyObj1: {
      //   name: '',
      //   phone: ''
      // },
      check1: '',
      date: '请选择',
      sex: '男',
      name: '',
      tel: '',
      bz: [],
      medical: '',
      accust: '',
      age: '',
      check2: '',
      index1: '',
      index2: '',
      index: '',
      array: [],
      array1: [],
      num: '',
      num1: '',
      height: '',
      weight: '',
      livingHabit: [],
      pastMedicalHistory: [],
      medicalHistoryId: '',
      content: '',
      multiIndex: 160,
      multiIndex1: 50,
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
      current: 0
    };
  },
  onLoad(option) {
    this.endDate = getCurrentDate();
    for (let j = 0; j < 240; j = j + 1) {
      this.array.push(j);
    }

    for (let i = 0; i <= 200; i = i + 1) {
      this.array1.push(i);
    }
    // this.array1.unshift('40kg以下')
    // this.array1.push('120kg以上')
    if (option.familyPhone) {
      this.familyPhone = option.familyPhone;
    }
    // 有家人手机号，请求家人信息
    // if (this.familyPhone) {
    //   this.getFamilyInfo()
    // } else {
    this.getlist();
    // }
  },
  beforeDestroy() {
    // if (!this.name || !this.date || !this.num || !this.num1) {
    //   return uni.$showMsg('信息不完整将会影响测验结果，请您知晓')
    // }
  },
  onShow() {
    if (uni.getStorageSync('hospName')) {
      this.selectHospital = uni.getStorageSync('hospName');
    }
  },
  onUnload() {
    uni.removeStorageSync('selectHospital');
  },
  computed: {},
  watch: {
    name: function (newValue) {
      this.yonghuname = !newValue; // 如果有值则为 false
    },
    // name: {
    //   handler(value) {
    //     this.star = !value ? true : false;
    //   },
    // },
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
    goSeHp() {
      console.log('点击跳转');
      let url = '/loginSign/pages/hospitals/hospitals';
      // throttleNavigate(url);
      uni.navigateTo({
        url: url
      });
    },
    // bindDateChange: function(e) {
    //   console.log(e)
    //   this.date = e.detail.value
    // },
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
        this.medical = 0;
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
    radioChange: function (e) {
      this.sex = e.detail.value;
    },
    bindDateChange: function (e) {
      console.log(e);
      this.date = e.detail.value;
      console.log('日期更变:', this.date);
    },
    async getFamilyInfo() {
      const { data: res } = await getUserInfo(this.familyPhone);
      console.log('获取家人信息', res);
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
    getinfo(phone) {
      var tel = phone || uni.getStorageSync('tel');
      getUserInfo(tel)
        .then((res) => {
          console.log('患者info: ', res.data.data);
          this.date = res.data.data.birthDay;
          this.name = res.data.data.userName;
          if (res.data.data.gender === '男') {
            this.sex = '1';
          } else {
            this.sex = '0';
          }
          if (res.data.data.gender === '男') {
            this.current = 0;
          } else {
            this.current = 1;
          }
          ////////////////////////////
          this.height = res.data.data.height;
          this.weight = res.data.data.weight;
          this.selectHospital = res.data.data.hospital;
          // console.log("a1,a2:",a1,a2)
          // console.log("b1,b2:",b1,b2)
          this.multiIndex = this.array.indexOf(this.height);
          //console.log("muiaa:",this.multiIndex[0])
          this.multiIndex1 = this.array1.indexOf(this.weight);
          // console.log("muiaa1:",this.multiIndex1[0])
          // console.log(this.multiIndex, 22)
          this.num = this.array[this.multiIndex];
          this.num1 = this.array1[this.multiIndex1];
          // console.log("array3",this.array3)
          // console.log("array4",this.array4)
          // console.log("身高体重：",this.num,this.num1)
          this.medicalHistoryId = res.data.data.medicalHistoryId;
          this.medical = res.data.data.pastMedicalHistory;
          this.accust = res.data.data.livingHabit;
          this.livingHabit = res.data.data.livingHabit.split(',');
          this.pastMedicalHistory = res.data.data.pastMedicalHistory.split(',');
          let newList1 = {
            name: '无'
          };

          const crr = [];
          for (var i in this.livingHabit) {
            crr.push(this.livingHabit[i]);
          }

          const drr = [];
          for (var i in this.xg) {
            drr.push(this.xg[i]);
          }
          drr.unshift(newList1);

          //var flag = 0
          var inde2 = [];
          for (var i in drr) {
            for (var x in crr) {
              if (drr[i].name == crr[x]) {
                inde2.push(i);
                //flag = 1
              }
            }
          }

          const arr = [];
          for (var i in this.pastMedicalHistory) {
            if (this.pastMedicalHistory[i] == '无') {
              arr.push('0');
              continue;
            }
            arr.push(this.pastMedicalHistory[i]);
          }

          console.log(arr, inde2);

          for (var i in arr) {
            const item = this.bz[arr[i] - 1];
            console.log(i);
            if (arr[i] == 0) {
              this.check1 = true;
            } else {
              this.$set(item, 'checked', true);
            }
          }

          for (var i in inde2) {
            const item = this.xg[inde2[i] - 1];
            console.log(this.xg[inde2[i] - 1]);
            if (inde2[i] == 0) {
              this.check2 = true;
            } else {
              this.$set(item, 'checked', true);
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getlist() {
      getDisease({
        pageSize: 100,
        pageNum: 1
      })
        .then((res) => {
          this.bz = res.data.rows;
          // console.log('bz: ', this.bz);
          this.$nextTick(() => {
            this.$refs.uReadMore.init();
          });
          if (this.familyPhone) {
            this.getinfo(this.familyPhone);
          } else {
            this.getinfo();
          }
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
      this.index = e.detail.value;
      this.height = this.array[this.index];
    },
    bindPickerChange1: function (e) {
      console.log('picker发送选择改变，携带值为', e.detail.value);
      this.index1 = e.detail.value;
      this.weight = this.array1[this.index1];
    },
    login() {
      if (this.check1.length == 0) {
        uni.showToast({
          title: '请选择病史',
          icon: 'none'
        });
        return;
      }
      if (this.check2.length == 0) {
        uni.showToast({
          title: '请选择习惯',
          icon: 'none'
        });
        return;
      }

      if (this.familyPhone) {
        this.getform2();
      } else {
        this.getform2();
      }
    },

    getform2() {
      var tel = this.familyPhone || uni.getStorageSync('tel');
      // console.log("sex选择:", this.sex)
      if (this.sex === '0') {
        this.sex = '女';
      } else {
        this.sex = '男';
      }
      // 对于用户输入信息的非空判断
      if (!this.name || !this.date || !this.num || !this.num1) {
        return uni.$showMsg('请填写完整信息后再提交');
      }
      // console.log(this.medical)
      updateUserInfo({
        medicalHistoryId: this.medicalHistoryId,
        height: parseFloat(this.num),
        weight: parseFloat(this.num1),
        pastMedicalHistory: this.medical,
        livingHabit: this.accust,
        patientPhone: tel,
        userName: this.name,
        gender: this.sex,
        birthDay: this.date,
        familyPhone: this.emergencyObj.phone,
        familyName: this.emergencyObj.name,
        hospital: this.selectHospital
      })
        .then((res) => {
          if (res.data.code == 200) {
            uni.setStorageSync('hospName', this.selectHospital);
            // 修改 barUser 数据
            uni.showToast({
              title: '提交成功',
              icon: 'none'
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1000);
          } else {
            uni.showToast({
              title: res.data.msg,
              icon: 'none'
            });
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
        year = year - 60;
      } else if (type === 'end') {
        year = year + 2;
      }
      month = month > 9 ? month : '0' + month;
      day = day > 9 ? day : '0' + day;
      return `${year}-${month}-${day}`;
    }
  }
};
</script>

<style scoped lang="scss">
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
  pointer-events: none;
  /* 防止伪元素影响输入框的点击事件 */
}

.input-code {
  position: relative;
  // padding-left: 20px; /* 给输入框留出空间 */
}

.fonts {
  // font-size: $fontSize;
  font-size: 30rpx;
  margin: 20rpx 0;
  color: #c4c4c4;
  text-align: center;
}

.lists .uni-list-cell {
  // width: 220rpx;
  width: 45%;
  // height: 65rpx;
  padding: 10rpx;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 40rpx;
  font-size: $fontSize;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #333333;
  box-sizing: border-box;
  margin: 10rpx;

  .ycName {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 100%;
  }
}

.lists .uni-list-cell.active {
  // background: linear-gradient(90deg, #00D6DC 0%, #27A2F2 100%);
  background-color: #00ca99;
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
  color: #000;
}

.content {
  margin: 20rpx 30rpx;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 15rpx;
}

.list-item {
  align-items: center;
  // padding-left: 0 !important;
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
  padding: 0 45rpx;
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
  text-align: left;
  margin-right: 20rpx;
}

.input-code,
.list-item,
.sex {
  line-height: 100rpx;
  height: 100rpx;
  width: 90%;
  margin: 0 auto;
  font-size: $fontSize;
  // padding-left: 20rpx;
  color: #333333;
  position: relative;
  border-bottom: 1px solid rgba(221, 221, 221, 0.4);
}

.list-item picker {
  width: 60%;
  text-align: right;
  // padding-right: 40rpx;
}

.list-item image {
  position: absolute;
  top: 40rpx;
  right: 20rpx;
}

.font {
}

.list-item {
  display: flex;
  justify-content: space-between;
  .requireStyle {
    color: red;
    font-size: 50rpx;
    margin-right: 10rpx;
    // line-height: 100rpx;
  }
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

.btn {
  margin: 0 30rpx;
  height: 90rpx;
  // background: linear-gradient(-84deg, #00D6DC, #27A2F2);
  background-color: #00ca99;
  border-radius: 45rpx;
  font-size: $fontSize;
  line-height: 90rpx;
  color: #ffffff;
  text-align: center;
}
</style>
