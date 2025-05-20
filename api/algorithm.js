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