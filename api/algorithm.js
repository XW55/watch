import {
  request
} from '@/request/index.js'
// 上传皮电数据
export const updateEdaData = (data) => {
  return request({
    url: "EEG/EDA/upload_dynamic_eda",
    method: "POST",
    urlType: 2,
    data,
    header: {
      // Authorization: `Bearer ${uni.getStorageSync("token")}`
      "content-type": "application/json",
      user: "zzu",
      password: "manb"
    },
  });
};


// 心电、皮电、脑电上传
export const ECGEDAEEGData = (data) => {
  return request({
    url: "upload_dynamic",
    method: "POST",
    urlType: 3,
    data,
    header: {
      // Authorization: `Bearer ${uni.getStorageSync("token")}`
      "content-type": "application/json",
      user: "zzu",
      password: "zzu_api"
    },
  });
};