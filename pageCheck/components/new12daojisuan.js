// '获取服务失败',
//    '设备地址无效，请先连接设备',
//    'indexSwave',
//    'getStorageSync',
//    'startBluetoothDevicesDiscovery',
//    'closeBluetoothAdapter',
//    'errCode',
//    'none',
//    'toString',
//    'getBLEDeviceCharacteristics',
//    'abs',
//    'isSigunsteady',
//    'onBLECharacteristicValueChange',
//    'openBluetoothAdapter',
//    'deviceId',
//    '请设置微信使用定位权限，用于设备的连接',
//    'drawDataAry',
//    'commit',
//    'showToast',
//    'getAppAuthorizeSetting',
//    'interval',
//    'length',
//    'value',
//    'max',
//    'exports',
//    'min',
//    '请打开蓝牙，用于设备的连接',
//    'connected',
//    'indexOf',
//    'slice',
//    '974CBE32-3E83-465E-ACDE-6F92FE712134',
//    'closeBLEConnection',
//    'changeBleConnectStatus',
//    'denied',
//    'push',
//    '连接超时',
//    'substr',
//    'RPeakHeight',
//    'apply',
//    'getSystemInfoSync',
//    'bluetoothAuthorized',
//    'locationEnabled',
//    '获取特征值失败',
//    'platform',
//    'fill'

const temp_all = [
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0]
];

export default {
  // cmdArr: [
  //   '获取服务失败',
  //   '设备地址无效，请先连接设备',
  //   'indexSwave',
  //   'getStorageSync',
  //   'startBluetoothDevicesDiscovery',
  //   'closeBluetoothAdapter',
  //   'errCode',
  //   'none',
  //   'toString',
  //   'getBLEDeviceCharacteristics',
  //   'abs',
  //   'isSigunsteady',
  //   'onBLECharacteristicValueChange',
  //   'openBluetoothAdapter',
  //   'deviceId',
  //   '请设置微信使用定位权限，用于设备的连接',
  //   'drawDataAry',
  //   'commit',
  //   'showToast',
  //   'getAppAuthorizeSetting',
  //   'interval',
  //   'length',
  //   'value',
  //   'max',
  //   'exports',
  //   'min',
  //   '请打开蓝牙，用于设备的连接',
  //   'connected',
  //   'indexOf',
  //   'slice',
  //   '974CBE32-3E83-465E-ACDE-6F92FE712134',
  //   'closeBLEConnection',
  //   'changeBleConnectStatus',
  //   'denied',
  //   'push',
  //   '连接超时',
  //   'substr',
  //   'RPeakHeight',
  //   'apply',
  //   'getSystemInfoSync',
  //   'bluetoothAuthorized',
  //   'locationEnabled',
  //   '获取特征值失败',
  //   'platform',
  //   'fill'
  // ],

  // getCmdArr(val, l2) {
  //   val -= 0;
  //   return this.cmdArr[val];
  // },
  // wlFilter(_0x208a93) {
  //   // console.log('滤波函数接收得数据', _0x208a93);
  //   const _0x55d56e = this.wlphasefilt(_0x208a93);
  //   const _0x7dafc2 = this.wlcommonfilt(_0x55d56e, Boolean([]));
  //   return this.wlcommonfilt(_0x7dafc2, ![]);
  // },
  // wlphasefilt(_0x953224) {
  //   const _0x3fa35a = new Array(_0x953224.length);
  //   const _0x523f3c = [0x0, 0x0, 0x0];
  //   const _0x150ff2 = [0.9987449394335488];
  //   const _0x3bf2f9 = [
  //     [0x1, -0x1, 0x0, 0x1, -0.9974898788670975, 0x0]
  //   ];
  //   for (let _0x3921f5 = 0x0; _0x3921f5 < 0x1; _0x3921f5++) {
  //     temp_all[_0x3921f5][0x0] = 0x0;
  //     temp_all[_0x3921f5][0x1] = 0x0;
  //   }
  //   for (let _0x4fdbea = _0x953224.length - 0x1; _0x4fdbea >= 0x0; _0x4fdbea--) {
  //     if (_0x4fdbea == _0x953224[this.getCmdArr('0x15')] - 0x1) {
  //       _0x523f3c[0x0] = _0x953224[_0x4fdbea];
  //       _0x523f3c[0x1] = _0x953224[_0x4fdbea];
  //       _0x523f3c[0x2] = _0x953224[_0x4fdbea];
  //     } else if (_0x4fdbea == _0x953224[this.getCmdArr('0x15')] - 0x2) {
  //       _0x523f3c[0x0] = _0x953224[_0x4fdbea + 0x1];
  //       _0x523f3c[0x1] = _0x953224[_0x4fdbea + 0x1];
  //       _0x523f3c[0x2] = _0x953224[_0x4fdbea];
  //     } else {
  //       _0x523f3c[0x0] = _0x953224[_0x4fdbea + 0x2];
  //       _0x523f3c[0x1] = _0x953224[_0x4fdbea + 0x1];
  //       _0x523f3c[0x2] = _0x953224[_0x4fdbea];
  //     }
  //     _0x3fa35a[_0x4fdbea] = this.iir_stream_all(
  //       _0x523f3c[0x0],
  //       _0x523f3c[0x1],
  //       _0x523f3c[0x2],
  //       _0x3bf2f9,
  //       _0x150ff2,
  //       0x1
  //     );
  //   }
  //   return _0x3fa35a;
  // },
  // iir_stream_all(_0x8c981d, _0x3b944a, _0x391e11, _0x47236e, _0x49e2d9, _0x1376a3) {
  //   let _0xdfdbb = _0x8c981d;
  //   let _0x4337bb = _0x3b944a;
  //   let _0x1e41d6 = _0x391e11;
  //   for (let _0x3a749e = 0x0; _0x3a749e < _0x1376a3; _0x3a749e++) {
  //     const _0x12c429 = temp_all[_0x3a749e][0x0];
  //     const _0x4818a2 = temp_all[_0x3a749e][0x1];
  //     _0x1e41d6 =
  //       _0x49e2d9[_0x3a749e] *
  //       (_0x1e41d6 * _0x47236e[_0x3a749e][0x0] +
  //         _0x4337bb * _0x47236e[_0x3a749e][0x1] +
  //         _0xdfdbb * _0x47236e[_0x3a749e][0x2]) -
  //       _0x4818a2 * _0x47236e[_0x3a749e][0x4] -
  //       _0x12c429 * _0x47236e[_0x3a749e][0x5];
  //     _0xdfdbb = _0x12c429;
  //     _0x4337bb = _0x4818a2;
  //     temp_all[_0x3a749e][0x0] = _0x4818a2;
  //     temp_all[_0x3a749e][0x1] = _0x1e41d6;
  //   }
  //   return _0x1e41d6;
  // },
  // wlbasecommonfilt(_0x3ecb85, _0x2cf762, _0x312819, _0x1e3f7f, _0x293a9d) {
  //   const _0x41cc89 = [0x0, 0x0, 0x0];
  //   for (let _0x1fb330 = 0x0; _0x1fb330 < _0x293a9d; _0x1fb330++) {
  //     temp_all[_0x1fb330][0x0] = 0x0;
  //     temp_all[_0x1fb330][0x1] = 0x0;
  //   }
  //   const _0x1dbc4a = new Array(_0x3ecb85.length);
  //   if (_0x2cf762) {
  //     for (let _0x4ff8ec = 0x0; _0x4ff8ec < _0x3ecb85[this.getCmdArr('0x15')]; _0x4ff8ec++) {
  //       if (_0x4ff8ec == 0x0) {
  //         _0x41cc89[0x0] = _0x3ecb85[_0x4ff8ec];
  //         _0x41cc89[0x1] = _0x3ecb85[_0x4ff8ec];
  //         _0x41cc89[0x2] = _0x3ecb85[_0x4ff8ec];
  //       } else if (_0x4ff8ec == 0x1) {
  //         _0x41cc89[0x0] = _0x3ecb85[_0x4ff8ec - 0x1];
  //         _0x41cc89[0x1] = _0x3ecb85[_0x4ff8ec - 0x1];
  //         _0x41cc89[0x2] = _0x3ecb85[_0x4ff8ec];
  //       } else {
  //         _0x41cc89[0x0] = _0x3ecb85[_0x4ff8ec - 0x2];
  //         _0x41cc89[0x1] = _0x3ecb85[_0x4ff8ec - 0x1];
  //         _0x41cc89[0x2] = _0x3ecb85[_0x4ff8ec];
  //       }
  //       _0x1dbc4a[_0x4ff8ec] = this.iir_stream_all(
  //         _0x41cc89[0x0],
  //         _0x41cc89[0x1],
  //         _0x41cc89[0x2],
  //         _0x312819,
  //         _0x1e3f7f,
  //         _0x293a9d
  //       );
  //     }
  //   } else {
  //     for (let _0x23d0db = _0x3ecb85[this.getCmdArr('0x15')] - 0x1; _0x23d0db >= 0x0; _0x23d0db--) {
  //       if (_0x23d0db == _0x3ecb85[this.getCmdArr('0x15')] - 0x1) {
  //         _0x41cc89[0x0] = _0x3ecb85[_0x23d0db];
  //         _0x41cc89[0x1] = _0x3ecb85[_0x23d0db];
  //         _0x41cc89[0x2] = _0x3ecb85[_0x23d0db];
  //       } else if (_0x23d0db == _0x3ecb85.length - 0x2) {
  //         _0x41cc89[0x0] = _0x3ecb85[_0x23d0db + 0x1];
  //         _0x41cc89[0x1] = _0x3ecb85[_0x23d0db + 0x1];
  //         _0x41cc89[0x2] = _0x3ecb85[_0x23d0db];
  //       } else {
  //         _0x41cc89[0x0] = _0x3ecb85[_0x23d0db + 0x2];
  //         _0x41cc89[0x1] = _0x3ecb85[_0x23d0db + 0x1];
  //         _0x41cc89[0x2] = _0x3ecb85[_0x23d0db];
  //       }
  //       _0x1dbc4a[_0x23d0db] = this.iir_stream_all(
  //         _0x41cc89[0x0],
  //         _0x41cc89[0x1],
  //         _0x41cc89[0x2],
  //         _0x312819,
  //         _0x1e3f7f,
  //         _0x293a9d
  //       );
  //     }
  //   }
  //   return _0x1dbc4a;
  // },


  // 滤波器函数
  wlFilter(data) {
    let phaseFilteredData = this.wlphasefilt(data);
    let commonFilteredData = this.wlcommonfilt(phaseFilteredData, Boolean([]));
    return this.wlcommonfilt(commonFilteredData, ![]);
  },

  // 相位滤波器
  wlphasefilt(data) {
    let output = new Array(data.length);
    let state = [0, 0, 0];
    let coefficients = [0.9987449394335488];
    let filterCoefficients = [
      [1, -1, 0, 1, -0.9974898788670975, 0]
    ];

    for (let i = 0; i < 1; i++) {
      temp_all[i][0] = 0;
      temp_all[i][1] = 0;
    }
    for (let j = data.length - 1; j >= 0; j--) {
      if (j == data.length - 1) {
        state[0] = data[j];
        state[1] = data[j];
        state[2] = data[j];
      } else if (j == data.length - 2) {
        state[0] = data[j + 1];
        state[1] = data[j + 1];
        state[2] = data[j];
      } else {
        state[0] = data[j + 2];
        state[1] = data[j + 1];
        state[2] = data[j];
      }
      output[j] = this.iir_stream_all(
        state[0], state[1], state[2],
        filterCoefficients,
        coefficients,
        1
      );
    }
    return output;
  },
  // IIR滤波器流处理
  iir_stream_all(input1, input2, input3, filterCoeffs, coeffs, times) {
    let prevOutput1 = input1;
    let prevOutput2 = input2;
    let currentOutput = input3;
    for (let k = 0; k < times; k++) {
      let tempState1 = temp_all[k][0];
      let tempState2 = temp_all[k][1];
      currentOutput =
        coeffs[k] *
        (currentOutput * filterCoeffs[k][0] +
          prevOutput2 * filterCoeffs[k][1] +
          prevOutput1 * filterCoeffs[k][2]) -
        tempState2 * filterCoeffs[k][4] -
        tempState1 * filterCoeffs[k][5];
      prevOutput1 = tempState1;
      prevOutput2 = tempState2;
      temp_all[k][0] = tempState2;
      temp_all[k][1] = currentOutput;
    }
    return currentOutput;
  },
  wlcommonfilt(data, flag) {
    const coeffA = [
      0.9911535951016633, 0.9681522377236349, 0.9681522377236349, 0.9408092961815946, 0.05499010707291403,
      0.04613180209331293, 0.04220640333661781
    ];
    const coeffB = [
      [1, -0x2, 1, 1, -1.982228929792528, 0.9823854506141251],
      [1, -1.621233121980644, 1, 1, -1.501787337686438, 0.9347547531033475],
      [1, -1.621233121980644, 1, 1, -1.633042983240282, 0.9436248404806153],
      [1, -1.621233121980644, 1, 1, -1.525271192436899, 0.8816185923631893],
      [1, 2, 1, 1, -1.558312063461799, 0.7782724917534555],
      [1, 2, 1, 1, -1.307285028849323, 0.4918122372225753],
      [1, 2, 1, 1, -1.196046906902314, 0.3648725202487851]
    ];
    return this.wlbasecommonfilt(data, flag, coeffB, coeffA, 7);

  },
  // 基础共同滤波器
  wlbasecommonfilt(data, flag, coeffB, coeffA, count) {
    let state = [0, 0, 0];
    for (let l = 0; l < count; l++) {
      temp_all[l][0] = 0;
      temp_all[l][1] = 0;
    }
    let output = new Array(data.length);
    if (flag) {
      for (let m = 0; m < data.length; m++) {
        if (m == 0) {
          state[0] = data[m];
          state[1] = data[m];
          state[2] = data[m];
        } else if (m == 1) {
          state[0] = data[m - 1];
          state[1] = data[m - 1];
          state[2] = data[m];
        } else {
          state[0] = data[m - 2];
          state[1] = data[m - 1];
          state[2] = data[m];
        }
        output[m] = this.iir_stream_all(state[0], state[1], state[2], coeffB, coeffA, count);
      }
    } else {
      for (let n = data.length - 1; n >= 0; n--) {
        if (n == data.length - 1) {
          state[0] = data[n];
          state[1] = data[n];
          state[2] = data[n];
        } else if (n == data.length - 2) {
          state[0] = data[n + 1];
          state[1] = data[n + 1];
          state[2] = data[n];
        } else {
          state[0] = data[n + 2];
          state[1] = data[n + 1];
          state[2] = data[n];
        }
        output[n] = this.iir_stream_all(state[0], state[1], state[2], coeffB, coeffA, count);
      }
    }
    return output;
  },
  // -------------------------------------------------------------------------
  // 计算心率
  /**
   * 处理 ECG 数据并返回分析结果
   *
   * @param {number[]} inputArray - 原始输入信号数据（长度 >= 2000）
   * @returns {Object} - 包含心率等信息的结果对象
   */
  computeECGByTwothousand(inputArray) {
    const SAMPLE_COUNT = 1000; // 采样点数量 (0x3e8)
    const DRAW_LENGTH = 750; // 绘图长度 (0x2ee)
    const OFFSET = 25;

    // 下采样原始信号，每隔一个点取一个
    const filteredSamples = new Array(SAMPLE_COUNT).fill(0);
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      filteredSamples[i] = inputArray[i * 2];
    }

    // 应用不同窗口大小的中值滤波
    const longMedian = this.medianBiquad(filteredSamples, 20); // 长窗口 (0x14)
    const shortMedian = this.medianBiquad(filteredSamples, 50); // 短窗口 x2 (0x32)
    const baseMedian = this.medianBiquad(filteredSamples, 10); // 基础窗口 (0xa)

    // 截取感兴趣区间（去除前250个点 + 后移OFFSET）
    const signalSegment = filteredSamples.slice(250 - OFFSET, 1000 - OFFSET);
    const baseSegment = baseMedian.slice(250 - OFFSET, 1000 - OFFSET);

    // 初始化结果对象
    const result = {
      isSigunsteady: false,
      meanHR: 0,
      secondSteady: 0,
      RPeakHeight: 0,
      SwaveMinHeight: 0,
      drawDataAry: new Array(DRAW_LENGTH).fill(0)
    };

    let peakIndexList = [];
    let valleyIndexList = [];

    // 判断信号是否稳定
    result.isSigunsteady = this.computeSigunsteady(signalSegment, baseSegment);

    // 计算心率间隔和峰谷位置
    const hrIntervalResult = this.computeHRinterval(signalSegment, longMedian.slice(250 - OFFSET, 1000 - OFFSET));

    peakIndexList = hrIntervalResult.indexPeak;
    valleyIndexList = hrIntervalResult['indexSwave']; // 使用'indexSwave'

    // 计算平均心率
    if (hrIntervalResult.interval > 2) { // 使用'interval'
      result.meanHR = Number((936 / hrIntervalResult.interval).toFixed(1));
    }

    // 如果检测到 R 波，则进行平滑处理
    if (peakIndexList.length > 0) {
      const smoothedRPeaks = this.smooth_shipR(
        shortMedian.slice(250 - OFFSET, 1000 - OFFSET),
        peakIndexList,
        15, // windowSize (0xf)
        7, // leftOffset (0x7)
        7 // rightOffset (0x7)
      );

      // 填充绘图数据
      for (let i = 0; i < DRAW_LENGTH; i++) {
        result.drawDataAry[i] = smoothedRPeaks[i];
      }

      // 获取 R 波最大高度
      result.RPeakHeight = Math.max(...peakIndexList.map(i => smoothedRPeaks[i]));

      // 获取 S 波最小高度
      if (valleyIndexList.length > 0) {
        result.SwaveMinHeight = Math.min(...valleyIndexList.map(i => smoothedRPeaks[i]));
      }
    } else {
      // 如果没有检测到峰点，直接使用中值滤波后数据绘制
      for (let i = 0; i < DRAW_LENGTH; i++) {
        result.drawDataAry[i] = shortMedian[i + 250 - OFFSET];
      }
    }

    return result;
  },
  findInsertIndex(arr, value) {
    let low = 0,
      high = arr.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (arr[mid] < value) low = mid + 1;
      else high = mid;
    }
    return low;
  },
  medianBiquad(dataArray, windowSize) {


    if (dataArray.length <= windowSize) {
      return dataArray;
    }
    //获取前20条数据+1000条数据+后20条数据，总数据为1040
    const kuozhan = [...dataArray.slice(0, windowSize), ...dataArray, ...dataArray.slice(-windowSize)];
    //获取前40条数据做升序
    const suoxiao = kuozhan.slice(0, 2 * windowSize + 1).sort((a, b) => a - b);
    const medians = [];

    for (let i = 0; i < dataArray.length - 1; i++) {
      medians.push(dataArray[i] - suoxiao[windowSize]);

      const removedItem = kuozhan[i];
      const removeIndex = suoxiao.indexOf(removedItem);
      if (removeIndex !== -1) {
        suoxiao.splice(removeIndex, 1);
      }

      const newItem = kuozhan[i + 2 * windowSize + 1];
      const insertIndex = this.findInsertIndex(suoxiao, newItem);
      suoxiao.splice(insertIndex, 0, newItem);
    }

    medians.push(dataArray[dataArray.length - 1] - suoxiao[windowSize]);
    return medians;
  },
  // 该函数用于判断信号是否稳定。
  computeSigunsteady(originalSignal, filteredSignal) {
    let maxDiff = 0;

    for (let i = 0; i < originalSignal.length; i++) {
      const diff = Math.abs(filteredSignal[i] - originalSignal[i]);
      maxDiff = Math.max(diff, maxDiff);
    }

    // 如果最大差值大于 1000，则返回 false（不稳定），否则返回 true（稳定）
    return maxDiff <= 1000;
  },
  //计算输入数组的无偏方差
  wlvar(dataArray) {
    if (dataArray.length > 1) {
      const meanValue = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
      let sumOfSquares = 0;

      for (let i = 0; i < dataArray.length; i++) {
        sumOfSquares += Math.pow(dataArray[i] - meanValue, 2);
      }

      return sumOfSquares / (dataArray.length - 1);
    } else {
      return 0;
    }
  },
  //这个函数用于计算心率间隔，并且检测 R 波峰和 S 波谷的位置。
  computeHRinterval(originalSignal, filteredSignal) {
    const derivative1 = new Array(filteredSignal.length).fill(0);
    const DERIVATIVE_WINDOW_1 = 4;

    for (let i = DERIVATIVE_WINDOW_1; i < filteredSignal.length - DERIVATIVE_WINDOW_1; i++) {
      derivative1[i] = filteredSignal[i] - filteredSignal[i + DERIVATIVE_WINDOW_1];
    }

    const derivative2 = new Array(derivative1.length).fill(0);
    const DERIVATIVE_WINDOW_2 = 7;

    for (let i = DERIVATIVE_WINDOW_2; i < derivative1.length - DERIVATIVE_WINDOW_2; i++) {
      derivative2[i] = derivative1[i] - derivative1[i - DERIVATIVE_WINDOW_2];
    }

    let threshold = Math.max(...derivative2) * 0.4;
    threshold = Math.min(threshold, 500); // 上限为500

    const peakThreshold = Math.max(80, threshold); // 设置最低峰值阈值为80

    const peaks = [];
    const sWaves = [];
    let lastPeakIndex = -10000;

    const PEAK_SEARCH_WINDOW = 7;

    for (let i = PEAK_SEARCH_WINDOW; i < derivative2.length - PEAK_SEARCH_WINDOW; i++) {
      if (
        derivative2[i] > peakThreshold &&
        derivative2[i] >= derivative2[i - 1] &&
        derivative2[i] >= derivative2[i + 1] &&
        i - lastPeakIndex > 60 // 至少间隔60个样本点
      ) {
        let foundPeak = false;
        let peakIndex = i;
        let maxAmplitude = -1000;

        for (let j = -PEAK_SEARCH_WINDOW; j < PEAK_SEARCH_WINDOW; j++) {
          const index = i + j;
          if (
            originalSignal[index] >= originalSignal[index - 1] &&
            originalSignal[index] >= originalSignal[index + 1]
          ) {
            foundPeak = true;
            if (originalSignal[index] > maxAmplitude) {
              maxAmplitude = originalSignal[index];
              peakIndex = index;
            }
          }
        }

        if (foundPeak) {
          peaks.push(peakIndex);
          lastPeakIndex = peakIndex;

          // 查找 S 波（局部最小值）
          for (let j = 0; j < 14; j++) {
            const index = peakIndex + j;
            if (
              originalSignal[index] <= originalSignal[index - 1] &&
              originalSignal[index] <= originalSignal[index + 1]
            ) {
              sWaves.push(index);
              break;
            }
          }
        }
      }
    }

    // 判断信号是否稳定
    let isStable = false;
    let averageInterval = 0;

    const STABILITY_CHECK_WINDOW = 30;

    if (peaks.length > 0) {
      // 抑制部分区域的干扰
      for (let i = 0; i < peaks.length; i++) {
        const start = Math.max(peaks[i] - STABILITY_CHECK_WINDOW, 0);
        const end = Math.min(peaks[i] + STABILITY_CHECK_WINDOW, derivative2.length);
        for (let j = start; j < end; j++) {
          derivative2[j] = 0;
        }
      }

      const noiseLevel = threshold / Math.sqrt(this.wlvar(derivative2));
      if (noiseLevel > 2 && threshold > 50) {
        isStable = true;
      }
    }

    // 计算平均心率间隔
    if (peaks.length > 2) {
      const intervals = [];
      for (let i = 1; i < peaks.length; i++) {
        intervals.push(peaks[i] - peaks[i - 1]);
      }

      const minInterval = Math.min(...intervals);
      const maxInterval = Math.max(...intervals);

      if (minInterval / maxInterval < 1.35) { // 稳定性检查
        averageInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
      }
    } else if (peaks.length === 2) {
      averageInterval = peaks[1] - peaks[0];
      if (averageInterval < 200 || averageInterval > 400) {
        averageInterval = 0;
      }
    }

    if (!isStable) {
      averageInterval = 0;
    }

    return {
      interval: averageInterval,
      indexPeak: peaks,
      indexSwave: sWaves
    };
  },
  // 用于计算一个数组的平均值
  mean(array) {
    if (array.length === 0) {
      return 0;
    }

    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i];
    }

    return sum / array.length;
  },
  /**
   * 对 ECG 信号中的 R 峰点区域进行局部平滑处理
   *
   * @param {number[]} signal - 原始 ECG 信号数据
   * @param {number[]} peakIndices - 检测到的 R 峰点索引列表
   * @param {number} windowSize - 平滑窗口总大小
   * @param {number} leftOffset - 左侧偏移量（前向范围）
   * @param {number} rightOffset - 右侧偏移量（后向范围）
   * @returns {number[]} - 平滑后的 ECG 信号副本
   */
  smooth_shipR(signal, peakIndices, windowSize, leftOffset, rightOffset) {
    const halfWindowSize = Math.ceil(windowSize / 2);
    let currentIndex = 0;
    let peakIndex = 0;

    // 创建信号副本用于写入平滑后的数据
    const smoothedSignal = [...signal];

    // 如果第一个峰点在 leftOffset 之前，则从该峰点开始处理
    if (peakIndices[peakIndex] < leftOffset) {
      currentIndex = peakIndices[peakIndex] + rightOffset;
      peakIndex = 1;
    }

    let currentWindowRadius = 0;

    while (currentIndex < signal.length) {
      // 判断是否进入下一个峰点附近
      if (peakIndex < peakIndices.length && currentIndex + currentWindowRadius >= peakIndices[peakIndex] - leftOffset) {
        if (currentWindowRadius >= 1) {
          currentWindowRadius--;
        } else {
          // 移动到下一个峰点后的位置
          currentIndex = currentIndex + leftOffset + rightOffset;
          peakIndex++;
          if (currentIndex > signal.length) break;
        }
        // 对当前位置做局部均值平滑
        smoothedSignal[currentIndex] = this.mean(signal.slice(currentIndex - currentWindowRadius, currentIndex +
          currentWindowRadius + 1));
      }
      // 当前位置超出信号长度时尝试缩小窗口半径
      else if (currentIndex + currentWindowRadius >= signal.length) {
        if (currentWindowRadius >= 1) {
          currentWindowRadius--;
        } else {
          break;
        }
        smoothedSignal[currentIndex] = this.mean(signal.slice(currentIndex - currentWindowRadius, currentIndex +
          currentWindowRadius + 1));
      }
      // 正常平滑处理
      else {
        smoothedSignal[currentIndex] = this.mean(signal.slice(currentIndex - currentWindowRadius, currentIndex +
          currentWindowRadius + 1));
        currentWindowRadius = Math.min(currentWindowRadius + 1, halfWindowSize);
      }

      currentIndex++;
    }

    return smoothedSignal;
  }


};