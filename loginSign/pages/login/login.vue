<template>
  <view class="page">
    <view class="top"></view>

    <!-- 验证码登录 -->
    <!-- #ifdef APP-PLUS || H5 || H5 -->
    <view>
      <view class="title">验证码登录</view>
      <view class="btn inputBox">
        <text class="iconfont icon-shouji"></text>
        <input type="number" style="width: 90%" placeholder="请输入手机号" v-model="userPhone" />
      </view>
      <view class="btn inputBox">
        <text style="font-size: 45rpx" class="iconfont icon-suozhu"></text>
        <input type="number" style="width: 380rpx" placeholder="请输入验证码" v-model="userPwdPhone" />
        <text class="getCodeBtn" @click="getPhonecode">{{ codeBtn.codeText }}</text>
      </view>
      <button class="btn" @click="login">登录</button>
    </view>
    <!-- #endif -->

    <!-- 隐私协议 -->
    <view class="xy">
      <checkbox-group @change="checkboxChange">
        <checkbox value="1" style="transform: scale(1); transform-origin: left center; margin-left: 70rpx" />
        <view>
          我已阅读并同意
          <navigator url="../privacyServices/privacyServices?title=服务协议" style="color: #00ca99">
            《服务协议》
          </navigator>
          与
          <navigator url="../privacyServices/privacyServices?title=隐私政策" style="color: #00ca99">
            《隐私政策》
          </navigator>
        </view>
      </checkbox-group>
    </view>
    <!-- 底部logo -->
    <view class="title logo">
      <image src="@/static/images/logo.png" class="logoImg"></image>
      迈雅云
    </view>
  </view>
</template>

<script>
import { getUserInfo, phoneLogin, getVerifyCode } from '@/api/loginSign/index.js';
import { mapMutations } from 'vuex';
export default {
  data() {
    return {
      userPhone: '',
      userPwdPhone: '',
      userPhone2: '',
      userPsd: '',
      ty: '',
      smsCode: '',
      uuid: '',
      tabCurrentIndex: 0,
      rules: {
        userPhone: {
          rule: /^1[3456789]\d{9}$/,
          msg: '请正确输入手机号'
        },
        userPwdPhone: {
          rule: /^[1-9][0-9]{0,3}$/,
          msg: '请输入4位以内数字验证码'
        },
        userPhone2: {
          rule: /^1[3456789]\d{9}$/,
          msg: '请正确输入手机号'
        },
        userPsd: {
          rule: /\S/,
          msg: '请输入验证码'
        }
      },

      codeBtn: {
        codeTime: 60,
        codeText: '获取验证码',
        codeStatus: true
      }
    };
  },
  onLoad(res) {},
  // 页面卸载时清除定时器，防止内存泄漏
  onUnload() {},
  onShow() {},
  methods: {
    ...mapMutations({
      setBarUser: 'SET_BAR_USER',
      setIsDoctor: 'SET_IS_DOCTOR'
    }),
    checkboxChange(e) {
      var _this = this;
      var ss = e.detail.value.length;
      if (ss > 0) {
        _this.ty = 1;
      } else {
        _this.ty = 0;
      }
    },

    validate(key) {
      let bool = true;

      if (!this.rules[key].rule.test(this[key])) {
        //提示信息

        uni.showToast({
          title: this.rules[key].msg,
          icon: 'none'
        });
        //取反
        bool = false;
        return false;
      }
      return bool;
    },

    getPhonecode() {
      var _this = this;
      if (this.validate('userPhone') && this.codeBtn.codeStatus) {
        this.codeBtn.codeStatus = false;
        let timerId = setInterval(() => {
          let codetime = this.codeBtn.codeTime;
          codetime--;
          this.codeBtn.codeTime = codetime;
          this.codeBtn.codeText = codetime + 's后重新获取';
          if (codetime < 1) {
            clearInterval(timerId);
            this.codeBtn.codeText = '重新获取';
            this.codeBtn.codeTime = 60;
            this.codeBtn.codeStatus = true;
          }
        }, 1000);
        _this.hqsjyzm();
      }
    },
    hqsjyzm() {
      console.log('调用了hqsjyzm函数');
      getVerifyCode({
        mobile: this.userPhone
      })
        .then((res) => {
          console.log('获取验证码成功');
          uni.showToast({
            title: '获取验证码成功',
            icon: 'none'
          });
          this.smsCode = res.data.smsCode;
          this.uuid = res.data.uuid;
          uni.setStorageSync('uuid', this.uuid);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    login() {
      let th = this;
      if (this.validate('userPhone') && this.validate('userPwdPhone')) {
        if (this.ty == 0) {
          uni.showToast({
            title: '请勾选条款',
            icon: 'none'
          });
          return;
        }
        phoneLogin({
          mobile: this.userPhone,
          smsCode: this.userPwdPhone,
          uuid: this.uuid
        })
          .then((res) => {
            console.log(res);
            if (res.data.code == 200) {
              uni.showToast({
                title: '登录成功',
                icon: 'none'
              });
              var token = res.data.token;
              uni.setStorageSync('token', token);
              uni.setStorageSync('tel', this.userPhone);

              if (res.data.BindingState) {
                th.getpersonalInformation(uni.getStorageSync('tel'));
                setTimeout(() => {
                  uni.switchTab({
                    url: '/pages/index/index'
                  });
                }, 2000);
              } else {
                setTimeout(() => {
                  uni.redirectTo({
                    url: '/loginSign/pages/information/information'
                  });
                }, 2000);
              }
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    getpersonalInformation(tel) {
      getUserInfo(tel)
        .then((res) => {
          if (res.data.code == 200) {
            console.log('患者info: ', res.data.data);
            let user = {
              name: res.data.data.userName,
              tel: res.data.data.patientPhone,
              sex: res.data.data.gender,
              hospName: res.data.data.hospital || '郑大',
              height: res.data.data.height,
              weight: res.data.data.weight
            };
            this.setBarUser(user);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
};
</script>

<style>
page {
  background: linear-gradient(180deg, #d9fff1, #d9fff100);
  background-repeat: no-repeat;
}
</style>
<style lang="scss" scoped>
.top {
  width: 100%;
  height: 220rpx;
}

.iconfont {
  margin-left: 30rpx;
  color: #00ca99;
  font-size: 40rpx;
}

.title {
  font-size: 52rpx;
  color: #00ca99;
  font-weight: 700;
  width: max-content;
  margin: 0 auto 100rpx;
  font-family: 'PingFang SC';
}

.xy {
  width: 80%;
  text-align: center;
  margin: 40rpx auto;
  color: #4f544f;
  font-size: 22rpx;
  white-space: nowrap;

  ::v-deep checkbox-group {
    display: flex;
    align-items: center;
  }

  navigator {
    display: inline-block;
  }
}

.page {
  height: 100vh;
  overflow: hidden;
}

.text {
  font-size: 28rpx;
  color: #666666;
  opacity: 0.8;
  align-items: center;
  display: flex;
  justify-content: center;
}

.btn {
  width: 90%;
  height: 90rpx;
  background-color: #00ca99;
  margin: 30rpx auto;
  border-radius: 40rpx;
  font-size: 32rpx;
  line-height: 90rpx;
  color: #ffffff;
  text-align: center;
}

.inputBox {
  border: 1rpx solid #00ca99;
  background-color: transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;

  input {
    color: #000;
    color: #000;
    height: 100%;
    text-align: left;
    margin-left: 20rpx;
  }

  .getCodeBtn {
    width: 200rpx;
    height: 60rpx;
    line-height: 55rpx;
    font-size: 28rpx;
    text-align: center;
    padding: 5rpx 10rpx;
    margin-right: 10rpx;
    border-radius: 40rpx;
    background-color: #00ca99;
    color: #fff;
  }
}

.logo {
  display: flex;
  align-items: center;
  font-size: 33rpx;
  font-weight: 700;
  margin: 400rpx auto 20rpx;
  color: #000;

  .logoImg {
    display: block;
    width: 40rpx;
    height: 40rpx;
    margin-right: 15rpx;
    vertical-align: middle;
  }
}
</style>
