// 导入 Vue 和 vuex 模块
import Vue from 'vue';
import Vuex from 'vuex';
// 导入用户收货地址
// import check4 from '@/store/modules/check4.js';
// 将 vuex 安装为 Vue 的插件
Vue.use(Vuex);
let detime = null;
let eleAry = [];
// 创建 store 的实例对象并向外共享
export default new Vuex.Store({
  // 挂载 store 模块
  // modules: {
  //   check4,
  // },
  // 相当于data
  state: {
    // 是否是医生
    isDoctor: false,
    ble: null,
    deviceName: '',
    deviceSN: {},
    deviceVersion: '',

    bleConnectState: false,
    barUser: {
      name: '',
      tel: '',
      hospName: '',
      sex: '',
      height: 170,
      weight: 120,
    },

    startCountingTime: null,
    // 概率
    gailvzhi: true,
  },
  // 相当于computed
  // getters: {
  //   bleConnectState(state) {
  //     return state.bleConnectState;
  //   },
  // },
  actions: {

  },
  // 相当于methods
  mutations: {
    SET_IS_DOCTOR: (state, isDoctor = false) => {
      state.isDoctor = isDoctor;
      uni.setStorageSync('isDoctor', isDoctor);
    },
    SET_BLE: (state, ble = '') => {
      state.ble = ble;
      uni.setStorageSync('ble', ble);
      console.log('vuex本地中得ble设备');
      console.log(uni.getStorageSync('ble'));
    },
    startCounting: (state, value) => {
      console.log('value111: ', value);
      state.startCountingTime = value;
    },
    setgailvzhi: (state, value) => {
      state.gailvzhi = value;
    },

    SET_BAR_USER: (state, user) => {
      state.barUser = {
        name: user.name,
        tel: user.tel,
        sex: user.sex,
        hospName: user.hospName,
        height: user.height,
        weight: user.weight,
      };
      console.log('vuex修改', state.barUser);
      uni.setStorageSync('user', user);
    },




    CLEAR_DEVICE: (state) => {
      state.deviceName = '';
      state.deviceSN = {};
      state.deviceVersion = '';
      state.bleConnectState = false;
      state.isDoctor = false;
    },
    // 设备名字
    changeDeviceNameStatus: (state, deviceName) => {
      state.deviceName = deviceName;
    },
    // 更改设备
    changeDeviceSNStatus: (state, deviceSN) => {
      console.log('vuex修改了sn码');
      console.log(deviceSN);
      state.deviceSN = deviceSN;
    },
    // 更改设备版本状态
    changeDeviceVersionStatus: (state, deviceVersion) => {
      state.deviceVersion = deviceVersion;
    },
    // 更改 BLE 连接
    changeBleConnectStatus: (state, newState) => {
      state.bleConnectState = newState;
    },

  },

});