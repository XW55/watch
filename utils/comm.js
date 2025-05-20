export function getCurrentTimeFormatted() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始
  const day = String(now.getDate()).padStart(2, '0');

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
// 上传数据生成PID
export function GUID() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
  const minute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  const second = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
  const millisecond = date.getMilliseconds() < 10 ?
    `00${date.getMilliseconds()}` :
    date.getMilliseconds() < 100 ?
    `0${
    date.getMilliseconds()}` :
    date.getMilliseconds();
  // 获得一个随机三位数字字符串,前两位可以为0
  let random = Math.floor(Math.random() * 1000000000000);
  random = random.toString().padStart(12, '0');
  // 添加更多的随机数，确保总长度为32位
  let extraRandom = Math.floor(Math.random() * 1000); // 3位随机数
  extraRandom = extraRandom.toString().padStart(3, '0');
  return String(String(String(String(String(String(String(year) + month) + day) + hour) + minute) + second) +
    millisecond) + random + extraRandom;
}