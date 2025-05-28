export const getIcon = (icon) => {
  // return `https://ecg.mindyard.cn:84/uploadPath/icon/index${icon}.png`;
}
// 获取当前年月日当前时间
export function getCurrentDate() {
  const now = new Date(); // 创建一个表示当前日期和时间的Date对象

  // 获取年份
  const year = now.getFullYear();

  // 获取月份（注意：getMonth() 返回的是0-11之间的数字，因此需要加1）
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 确保两位数格式，如01, 02, ..., 12

  // 获取日期
  const day = String(now.getDate()).padStart(2, '0'); // 确保两位数格式，如01, 02, ..., 31

  // 返回组合后的字符串，例如 "2025-01-15"
  return `${year}-${month}-${day}`;
}
/**
 * @param {Object} time
 * 这是将时间戳转换为正常时间的函数
 */
export function timeFormat(time) {
  const inputDatetime = new Date(time);
  const year = inputDatetime.getFullYear();
  const month = String(inputDatetime.getMonth() + 1).padStart(2, '0');
  const day = String(inputDatetime.getDate()).padStart(2, '0');
  const hour = String(inputDatetime.getHours()).padStart(2, '0');
  const minute = String(inputDatetime.getMinutes()).padStart(2, '0');
  const second = String(inputDatetime.getSeconds()).padStart(2, '0');
  return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
}

export const getDayString = (day) => {
  let globalToday = new Date();
  //以yyyy-MM-dd格式返回day天前的日期
  let today = new Date(globalToday.getTime() - day * 24 * 60 * 60 * 1000);
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  let day1 = today.getDate();
  month = month > 9 ? month : "0" + month;
  day1 = day1 > 9 ? day1 : "0" + day1;
  return `${year}-${month}-${day1}`;
}

import pg0 from '@/static/images/uninterpreted.png';
import pg1 from '@/static/images/Interpreted.png';
import pg2 from '@/static/images/reading.png';
import pg3 from '@/static/images/back.png';
// 解读图片
export const getImg = (val) => {
  if (val == 0) {
    return pg0;
  } else if (val == 1) {
    return pg1;
  } else if (val == 2) {
    return pg2;
  } else if (val == 3) {
    return pg3;
  }
}