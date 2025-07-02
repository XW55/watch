// 心电平台正式部署时的接口
export const baseUrl = 'https://ecg.mindyard.cn/prod-api/';
// export const baseUrl = "http://172.28.80.150:9000"
// export const baseUrl = "https://ecg.mindyard.cn/test-api/";

// 算法获取数据
const algorithmUrl = 'https://screen.mindyard.cn:84/';
const algorithmUploadUrltext = 'https://screen.mindyard.cn/test/api/'
// 算法上传接口
const algorithmUploadUrl = 'https://chronic.mindyard.cn/';
// 算法测试接口
// const algorithmUploadUrl = 'https://screen.mindyard.cn/test/'
export const algUrl = algorithmUploadUrl;
let isRedirectingToLogin = false;

// const handleUnAuthorized = () => {
//   return new Promise((resolve, reject) => {
//     if (isRedirectingToLogin) {
//       // 如果已经在跳转中，直接 reject
//       reject(new Error('Already redirecting to login page.'));
//       return;
//     }

//     // 设置跳转标志
//     isRedirectingToLogin = true;

//     // 提示用户登录
//     uni.showToast({
//       title: '您还未登录，请先登录',
//       icon: 'none'
//     });

//     // 延迟跳转到登录页面
//     setTimeout(() => {
//       try {
//         uni.navigateTo({
//           url: '/loginSign/pages/login/login', // 替换为你的登录页面路径
//           success: () => {
//             resolve(); // 成功后 resolve
//           },
//           fail: (err) => {
//             console.error('导航到登录页面失败:', err);
//             reject(new Error('Failed to navigate to login page.'));
//           }
//         });
//       } catch (error) {
//         console.error('导航到登录页面时发生异常:', error);
//         reject(error);
//       } finally {
//         // 重置跳转标志
//         isRedirectingToLogin = false;
//       }
//     }, 1500); // 延迟 1.5 秒
//   });
// };

const handleUnAuthorized = () => {
  return new Promise((resolve, reject) => {
    if (isRedirectingToLogin) {
      // 如果已经在跳转中，直接 reject
      reject(new Error('Already redirecting to login page.'));
      return;
    }

    // 设置跳转标志
    isRedirectingToLogin = true;

    uni.showModal({
      title: '提示',
      content: '登录已过期，请重新登录',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定');
          uni.navigateTo({
            url: '/loginSign/pages/login/login', // 替换为你的登录页面路径
            success: () => {
              resolve(); // 成功后 resolve
              isRedirectingToLogin = false;
            },
            fail: (err) => {
              console.error('导航到登录页面失败:', err);
              reject(new Error('Failed to navigate to login page.'));
            },
          });
        } else if (res.cancel) {
          console.log('用户点击取消');
          isRedirectingToLogin = false; // 取消时重置标志
          reject(new Error('User canceled the operation.'));
        }
      },
      fail: (err) => {
        console.error('显示 modal 失败:', err);
        isRedirectingToLogin = false; // 确保失败时也重置标志
        reject(err);
      },
    });

    // // 延迟跳转到登录页面
    // setTimeout(() => {
    //   try {
    //     uni.navigateTo({
    //       url: '/loginSign/pages/login/login', // 替换为你的登录页面路径
    //       success: () => {
    //         resolve(); // 成功后 resolve
    //       },
    //       fail: (err) => {
    //         console.error('导航到登录页面失败:', err);
    //         reject(new Error('Failed to navigate to login page.'));
    //       }
    //     });
    //   } catch (error) {
    //     console.error('导航到登录页面时发生异常:', error);
    //     reject(error);
    //   } finally {
    //     // 重置跳转标志
    //     isRedirectingToLogin = false;
    //   }
    // }, 1500); // 延迟 1.5 秒
  });
};

// 辅助函数：规范化 URL 拼接
const normalizeUrl = (baseUrl, relativeUrl) => {
  if (!relativeUrl || relativeUrl.startsWith('http')) {
    return relativeUrl; // 如果是完整 URL 或者为空，则直接返回
  }
  return `${baseUrl.replace(/\/+$/, '')}/${relativeUrl.replace(/^\/+/, '')}`;
};

let requestCount = 0;

export const request = (options, config = {}) => {
  // 默认请求头
  const defaultHeader = {
    'Content-Type': 'application/json',
  };

  // 根据配置决定是否添加 Authorization 头
  if (config.auth !== false) {
    const token = uni.getStorageSync('token');
    if (token) {
      defaultHeader.Authorization = token;
    }
  }


  // 根据请求类型选择基础URL
  let selectedBaseUrl;
  switch (options.urlType) {
    case 1:
      selectedBaseUrl = algorithmUrl;
      break;
    case 2:
      selectedBaseUrl = algorithmUploadUrl;
      break;
    case 3:
      selectedBaseUrl = algorithmUploadUrltext;
      break;
    default:
      selectedBaseUrl = baseUrl;
  }

  let headers = {};

  if (options.urlType == 1 || options.urlType == 2 || options.urlType == 3) {
    headers = options.header;
  } else {
    // 合并默认头部与自定义头部
    headers = {
      ...defaultHeader,
      ...(options.header || {}),
    };
  }


  return new Promise((resolve, reject) => {
    // 如果需要显示loading，增加计数器并在首次调用时显示loading
    if (!options.hideLoading && ++requestCount === 1) {
      uni.showLoading({
        title: '加载中',
      });
    }

    // console.log('地址', normalizeUrl(selectedBaseUrl, options.url));
    // console.log('方法', options.method || 'GET');
    // console.log('数据', options.data);
    // console.log('请求头', headers);
    console.log('上传路径', normalizeUrl(selectedBaseUrl, options.url));
    uni.request({
      url: normalizeUrl(selectedBaseUrl, options.url),
      method: options.method || 'GET',
      header: headers,
      dataType: options.dataType || 'json',
      data: options.data || {},
      success: (res) => {
        // console.log('request中的结果', res);
        const code = res.data.code || 200;
        if (code == 200) {
          resolve(res); // 只解析数据部分
        } else // 假设这是您的错误处理逻辑
          if (code === 401) {
            const pages = getCurrentPages();
            const currentPage = pages[pages.length - 1]; // 获取当前页面实例
            console.log('发送请求为401时监听当前页面', currentPage.route);
            // #ifdef H5
            if (currentPage.route == 'pages/index/index') {
              // ✅ 返回错误码给外部调用者
              return reject({
                code: 401,
                from: 'index'
              });
            }
            // #endif
            if (currentPage.route == 'loginSign/pages/login/login') {

            } else {
              handleUnAuthorized().then(() => {
                // 确保在处理完401错误后减少计数器
                if (--requestCount === 0) {
                  uni.hideLoading();
                }
              }).catch((error) => {
                console.error(error.message);
                if (--requestCount === 0) {
                  uni.hideLoading();
                }
                // 可以在这里选择抛出错误或者进行其他错误处理
              });
            }
          } else {
            uni.showToast({
              title: `${res.data.msg}`,
              icon: 'none',
            });
            if (--requestCount === 0) {
              uni.hideLoading();
            }
            reject(new Error(res.data.message || 'Unknown error'));
          }
      },
      fail: (err) => {
        console.log('请求失败', err);
        // uni.showToast({
        //   title: '请求失败,请检查网络或稍后重试',
        //   icon: 'none',
        // });
        console.error('请求失败的url是:', options.url.indexOf('http') === 0 ?
          options.url :
          normalizeUrl(
            selectedBaseUrl, options.url
          ));
        if (--requestCount === 0) {
          uni.hideLoading();
        }
        reject(err);
      },
      complete: () => {
        // 在complete回调中减少计数器
        if (--requestCount === 0) {
          uni.hideLoading();
        }
      },
    });
  });
};