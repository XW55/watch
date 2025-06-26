<template>
  <view class="page-container">
    <!-- 用户信息区域 -->
    <view class="user-profile" @click="tiaozhuan">
      <view class="" style="display: flex; align-items: center">
        <image class="avatar" src="/static/images/my-active.png" mode="aspectFill"></image>
        <text class="nickname">{{ zhi ? userInfo.name : '请登录' }}</text>
      </view>
      <view class="" v-if="zhi">
        <view class="btnn edit-btn">修改资料</view>
      </view>
    </view>

    <!-- 信息卡片 -->
    <view class="card">
      <view class="card-header">基本信息</view>
      <view class="card-body flex-container">
        <view class="info-row">
          <view>身高：</view>
          <view class="info-value">{{ userInfo.height }} cm</view>
        </view>
        <view class="info-row">
          <view>体重：</view>
          <view class="info-value">{{ userInfo.weight }} kg</view>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="card-header">健康信息</view>
      <view class="card-body flex-container">
        <view class="info-row">
          <view>患病史：</view>
          <view class="info-value">{{ userInfo.m_data }}</view>
        </view>
        <view class="info-row">
          <view>不良嗜好：</view>
          <view class="info-value">{{ userInfo.livingHabit }}</view>
        </view>
      </view>
    </view>

    <button @click="connect">链接脑电</button>

    <!-- 操作按钮 -->
    <view class="action-buttons" v-if="zhi">
      <view class="btn logout-btn" @click="tiaozhuann">退出登录</view>
    </view>
  </view>
</template>

<script>
import { getUserInfo, phoneLogin, getVerifyCode } from '@/api/loginSign/index.js';
import { mapMutations } from 'vuex';
const testModule = uni.requireNativePlugin('libmuse_android');
export default {
  data() {
    return {
      zhi: false,
      userInfo: {
        name: '',
        height: '无',
        weight: '无',
        m_data: '无',
        livingHabit: '无'
      }
    };
  },
  // watch: {
  //   '$store.state.user': {
  //     handler(newVal) {
  //       this.userInfo = newVal;
  //     },
  //     immediate: true
  //   }
  // },
  onShow() {
    if (uni.getStorageSync('tel')) {
      this.getpersonalInformation(uni.getStorageSync('tel'));
    }
  },
  methods: {
    ...mapMutations({
      setBarUser: 'SET_BAR_USER'
    }),
    connect() {
      console.log('jar包', JSON.stringify(testModule));
    },
    getpersonalInformation(tel) {
      let th = this;
      getUserInfo(tel)
        .then((res) => {
          if (res.data.code == 200) {
            th.zhi = true;
            console.log('患者info: ', res.data.data);
            let user = {
              name: res.data.data.userName,
              tel: res.data.data.patientPhone,
              sex: res.data.data.gender,
              hospName: res.data.data.hospital || '郑大',
              height: res.data.data.height,
              weight: res.data.data.weight,
              age: th.calculateAgeRealTime(res.data.data.birthDay),
              livingHabit: res.data.data.livingHabit || '无',
              m_data: res.data.data.m_data == 'null' ? '无' : res.data.data.m_data
            };
            this.setBarUser(user);
            this.userInfo = uni.getStorageSync('user');
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
    tiaozhuan() {
      if (!uni.getStorageSync('token')) {
        return uni.redirectTo({
          url: '/loginSign/pages/login/login'
        });
      }
      uni.navigateTo({
        url: '/loginSign/pages/modify/modify'
      });
    },
    tiaozhuann() {
      this.zhi = false;
      this.userInfo = {
        name: '',
        height: '无',
        weight: '无',
        m_data: '无',
        livingHabit: '无'
      };
      uni.closeBluetoothAdapter({
        success(res) {
          console.log(`关闭蓝牙适配${res}`);
        }
      });
      let user = {
        name: '',
        tel: '',
        sex: '',
        hospName: '',
        height: '',
        weight: '',
        age: '',
        livingHabit: '',
        m_data: ''
      };
      this.setBarUser(user);
      uni.clearStorageSync();
    }
  }
};
</script>
<style>
page {
  height: 100%;
}
</style>
<style scoped lang="scss">
.page-container {
  height: 100%;
}
/* 用户信息 */
.user-profile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 40rpx 30rpx;
  margin: 40rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-right: 40rpx;
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

/* 卡片样式 */
.card {
  background-color: rgba(255, 255, 255, 0.8);
  margin: 20rpx 40rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: #f0f8ff;
  padding: 20rpx 30rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  border-bottom: 2rpx solid #eee;
}

.card-body.flex-container {
  display: flex;
  justify-content: space-between;
  /* flex-direction: column;
  gap: 20rpx; */
  padding: 30rpx;
}

.info-row {
  /*  display: flex;
  justify-content: space-between; */
  width: 40%;
  font-size: 28rpx;
  color: #666;
}

.info-value {
  color: #333;
  font-weight: 500;
  font-size: 2em;
  margin-left: 15px;
}

/* 按钮区域 */
.action-buttons {
  margin: 20rpx 40rpx;
  padding: 40rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn {
  width: 100%;
  text-align: center;
  padding: 24rpx 60rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: bold;
  color: white;
  transition: background-color 0.3s ease;
}
.btnn {
  text-align: center;
  padding: 14rpx 32rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  /* font-weight: bold; */
  color: white;
  transition: background-color 0.3s ease;
  // border: 1px solid #4caf50;
}

.edit-btn {
  background-color: #09cc9d;
}

.logout-btn {
  background-color: #e53935;
}

.btn:active {
  opacity: 0.8;
}
</style>
<!-- <template>
  <view>
    <view
      class=""
      @click="tiaozhuan"
      style="
        width: 95%;
        margin: 0 auto;
        border-radius: 15rpx;
        background-color: #ff6c00;
        padding: 15rpx;
        color: #fff;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      修改个人信息
    </view>
    <view
      class=""
      @click="tiaozhuann"
      style="
        width: 95%;
        margin: 0 auto;
        border-radius: 15rpx;
        background-color: #ff6c00;
        padding: 15rpx;
        color: #fff;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      退出登录
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    tiaozhuan() {
      if (!uni.getStorageSync('token')) {
        return uni.redirectTo({
          url: '/loginSign/pages/login/login'
        });
      }
      uni.navigateTo({
        url: '/loginSign/pages/modify/modify'
      });
    },
    tiaozhuann() {
      uni.closeBluetoothAdapter({
        success(res) {
          console.log(`关闭蓝牙适配${res}`);
        }
      });
      uni.clearStorageSync();
    }
  }
};
</script>

<style lang="scss"></style -->
>
