import {
  request
} from '@/request/index.js'

// 小程序登录
export const wxLogin = (data) => {
  return request({
    url: `wxLogin`,
    method: "POST",
    data
  }, {
    auth: false
  });
}
// 通过手机号登录
export const phoneLoginByHeJia = (data) => {
  return request({
    url: `/singleSignOnLogin`,
    method: "POST",
    data
  }, {
    auth: false
  });
}
// app 端手机号登录
export const phoneLogin = (data) => {
  return request({
    url: `/sms/login`,
    method: "POST",
    data
  }, {
    auth: false
  });
}
// app 端获取验证码
export const getVerifyCode = (data) => {
  return request({
    url: `/sms/code`,
    method: "POST",
    data
  }, {
    auth: false
  });
}
// 获取隐私和协议
export const getPrivacy = (data) => {
  return request({
    url: `ecg_index/explain/getExplainByNameNotTo`,
    method: "GET",
    data
  }, {
    auth: false
  });
}

/**
 * 获取用户信息
 * @param phone 手机号
 */
export const getUserInfo = (phone) => {
  return request({
    url: `medicalHistory/medicalHistory/getByPatientPhone/${phone}`,
    method: "GET",
  });
};
// 修改用户信息
export const updateUserInfo = (data) => {
  return request({
    url: `medicalHistory/medicalHistory`,
    method: "PUT",
    data
  });
}
// 新增用户病史
export const addMedicalHistory = (data) => {
  return request({
    url: `medicalHistory/medicalHistory`,
    method: "POST",
    data
  });
}
// 查询疾病数据
export const getDisease = (data) => {
  return request({
    url: `medicalData/medicalData/list`,
    method: "GET",
    data
  });
}
// 注册用户
export const register = (data) => {
  return request({
    url: `appData/appData`,
    method: "POST",
    data
  });
}
// 是否参与了万人筛查
export const isJoin = (data) => {
  return request({
    url: `lease/lease/list`,
    method: "GET",
    data
  });
}
// 获取医院列表
export const getHospList = () => {
  return request({
    url: "hospital/hospital/appList",
    method: "get",
  });
};
// 绑定别人发送验证码
export const sendMsg = (phone) => {
  return request({
    url: "phoneCode/code",
    method: "POST",
    data: {
      mobile: phone,
    },
  });
};
/**
 * 获取用户信息,查询用户是否注册
 * @param phone
 * @returns {Promise<unknown>}
 */
export const inquireUser = (phone) => {
  return request({
    url: "appData/appData/list",
    method: "GET",
    data: {
      patientPhone: phone,
    },
  });
};
/**
 * 验证验证码
 * @param phone 手机号
 * @param code 验证码
 * @param uuid uuid
 * @returns {Promise}
 */
export const verifyCode = (phone, code, uuid) => {
  return request({
    url: "phoneCode/check",
    method: "POST",
    data: {
      mobile: phone,
      smsCode: code,
      uuid,
    },
  });
};

/**
 * 绑定家人(无手机号版)
 * @param data
 * @param data.patientName 患者姓名
 * @param data.patientSex 患者性别
 * @param data.patientAge 患者年龄
 * @param data.patientHeight 患者身高
 * @param data.patientWeight 患者体重
 * @param data.fatherPhone 绑定者手机号
 * @returns {Promise<unknown>}
 */
export const bindFamilyNoPhone = (data) => {
  return request({
    url: "relationship/relationship/addPatient",
    method: "POST",
    data,
  });
};