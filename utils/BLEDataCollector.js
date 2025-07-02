import {
  ECGEDAEEGData
} from '@/api/algorithm.js';
/**
 * BLE数据采集与定时上传类
 * 用于收集多个BLE设备的数据，并按指定时间间隔上传
 */
class BLEDataCollector {
  // 上传间隔时间（毫秒）
  static UPLOAD_INTERVAL = 10000;

  constructor() {
    // 存储数据的缓冲区
    this.dataBuffer = {
      // 心电数据缓冲区
      ecg_data: {
        I: [], //心电数据
        acc_x: [], //加速度x
        acc_y: [], //加速度y
        acc_z: [], //加速度z
        ang_x: [], //角速度x
        ang_y: [], //角速度y
        ang_z: [], //角速度z
      },
      // 第二种设备数据缓冲区
      eda_data: {
        acc: {
          ang_x: [],
          ang_y: [],
          ang_z: [],
        },
        red: [
          [],
          [],
          [],
          []
        ],
        infrared: [
          [],
          [],
          [],
          []
        ],
        I: []
      },
      // 第三种设备数据缓冲区
      eeg_data: {
        acc_x: [],
        acc_y: [],
        acc_z: [],
        FP1: [],
        // 右前额
        FP2: [],
        // 左耳
        T7: [],
        // 右耳
        T8: [],
        ang_x: [],
        ang_y: [],
        ang_z: [],
        PPG: [
          [],
          [],
          []
        ]
      }
    };
    this.dataBuffer.eda_data.red = Array(4).fill().map(() => []);
    this.dataBuffer.eda_data.infrared = Array(4).fill().map(() => []);
    this.dataBuffer.eeg_data.PPG = Array(3).fill().map(() => []);
    this.pId = '',
      // 定时器ID，用于取消定时上传
      this.uploadTimerId = null;

  }

  /**
   * 启动定时上传
   */
  startUploading(pId) {
    this.pId = pId
    if (this.uploadTimerId) {
      console.warn('上传已在进行中');
      return;
    }
    this.dataBuffer = {
      // 心电数据缓冲区
      ecg_data: {
        I: [], //心电数据
        acc_x: [], //加速度x
        acc_y: [], //加速度y
        acc_z: [], //加速度z
        ang_x: [], //角速度x
        ang_y: [], //角速度y
        ang_z: [], //角速度z
      },
      // 第二种设备数据缓冲区
      eda_data: {
        acc: {
          ang_x: [],
          ang_y: [],
          ang_z: [],
        },
        red: [
          [],
          [],
          [],
          []
        ],
        infrared: [
          [],
          [],
          [],
          []
        ],
        I: []
      },
      // 第三种设备数据缓冲区
      eeg_data: {
        acc_x: [],
        acc_y: [],
        acc_z: [],
        FP1: [],
        // 右前额
        FP2: [],
        // 左耳
        T7: [],
        // 右耳
        T8: [],
        ang_x: [],
        ang_y: [],
        ang_z: [],
        PPG: [
          [],
          [],
          []
        ]
      }
    };
    this.dataBuffer.eda_data.red = Array(4).fill().map(() => []);
    this.dataBuffer.eda_data.infrared = Array(4).fill().map(() => []);
    this.dataBuffer.eeg_data.PPG = Array(3).fill().map(() => []);
    // 启动定时器，每UPLOAD_INTERVAL毫秒上传一次数据
    this.uploadTimerId = setInterval(() => {
      this.uploadData();
    }, BLEDataCollector.UPLOAD_INTERVAL);
  }

  /**
   * 停止定时上传
   */
  stopUploading() {
    if (this.uploadTimerId) {
      clearInterval(this.uploadTimerId);
      this.uploadTimerId = null;
      this.pId = '';
      console.log('已停止定时上传数据');
    } else {
      console.warn('没有正在进行的上传任务');
    }
  }

  /**
   * 上传数据到服务器
   */
  uploadData() {
    // 复制当前缓冲区数据
    const dataToUpload = JSON.parse(JSON.stringify(this.dataBuffer));

    // 清空缓冲区，准备下一个周期的数据
    this.clearBuffer();
    dataToUpload.pId = this.pId;
    dataToUpload.ecg_data.sample_rate = 100
    dataToUpload.eda_data.sample_rate = 10
    dataToUpload.eeg_data.sample_rate = 100
    // 姓名
    dataToUpload.patient_name = '大反',
      // 性别
      dataToUpload.gender = '男',
      // 年龄
      dataToUpload.age = '23',
      //  设备号
      dataToUpload.deviceSN = '3*1',
      // 电话
      dataToUpload.patient_phone = '17839753707',
      // 数据类型
      dataToUpload.data_type = 'TrioSignal'
    // 发送数据到服务器
    this.sendDataToServer(dataToUpload);
  }

  /**
   * 清空数据缓冲区
   */
  clearBuffer() {
    Object.keys(this.dataBuffer).forEach(deviceKey => {
      const deviceData = this.dataBuffer[deviceKey];
      Object.keys(deviceData).forEach(dataKey => {
        const dataItem = deviceData[dataKey];
        if (Array.isArray(dataItem)) {
          dataItem.length = 0; // 清空数组
        } else if (typeof dataItem === 'object') {
          // 递归处理嵌套对象
          Object.keys(dataItem).forEach(nestedKey => {
            const nestedItem = dataItem[nestedKey];
            if (Array.isArray(nestedItem)) {
              nestedItem.length = 0;
            }
          });
        }
      });
    });
  }

  /**
   * 发送数据到服务器
   * @param {object} data - 要上传的数据
   */
  sendDataToServer(data) {
    // 这里实现实际的数据上传逻辑
    console.log('上传数据:', data);
    ECGEDAEEGData(data)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.error('上传失败:', err);

      });
  }

  /**
   * 处理心电数据
   * @param {number} zhi - 心电数据值
   */
  handleECGData(zhi) {
    // 将数据添加到缓冲区
    this.dataBuffer.ecg_data.I.push(...zhi);

  }

  /**
   * 处理心电加速度数据
   * @param {object} res - 加速度数据对象
   */
  handleECGAccData(res) {
    try {
      // 将数据添加到缓冲区
      this.dataBuffer.ecg_data.acc_x.push(...res.x);
      this.dataBuffer.ecg_data.acc_y.push(...res.y);
      this.dataBuffer.ecg_data.acc_z.push(...res.z);
      this.dataBuffer.ecg_data.ang_x.push(...res.x_g);
      this.dataBuffer.ecg_data.ang_y.push(...res.y_g);
      this.dataBuffer.ecg_data.ang_z.push(...res.z_g);
    } catch (error) {
      console.log('2---------------');
    }

  }

  /**
   * 处理第二种设备数据
   * @param {object} data - 数据对象
   */
  handleDevice2Data(data) {
    try {
      // 将数据添加到缓冲区
      if (data.acc) {
        this.dataBuffer.eda_data.acc.ang_x.push(data.acc.x);
        this.dataBuffer.eda_data.acc.ang_y.push(data.acc.y);
        this.dataBuffer.eda_data.acc.ang_z.push(data.acc.z);
      }

      if (data.red) {
        // console.log(data.red);
        // this.dataBuffer.eda_data.red[0].push(data.red[0]);
        // this.dataBuffer.eda_data.red[1].push(data.red[1]);
        // this.dataBuffer.eda_data.red[2].push(data.red[2]);
        // this.dataBuffer.eda_data.red[3].push(data.red[3]);
        // data.red.forEach((value, index) => {
        //   this.dataBuffer.eda_data.red[index].push(value);
        // });
        for (let i = 0; i < 4; i++) {
          if (!this.dataBuffer.eda_data.red[i]) this.dataBuffer.eda_data.red[i] = [];
        }
        data.red.forEach((value, index) => {
          this.dataBuffer.eda_data.red[index].push(value);
        });
      }

      if (data.infrared) {
        // console.log(data.infrared);
        // this.dataBuffer.eda_data.infrared[0].push(data.infrared[0]);
        // this.dataBuffer.eda_data.infrared[1].push(data.infrared[1]);
        // this.dataBuffer.eda_data.infrared[2].push(data.infrared[2]);
        // this.dataBuffer.eda_data.infrared[3].push(data.infrared[3]);
        // data.infrared.forEach((value, index) => {
        //   this.dataBuffer.eda_data.infrared[index].push(value);
        // });
        for (let i = 0; i < 4; i++) {
          if (!this.dataBuffer.eda_data.infrared[i]) this.dataBuffer.eda_data.infrared[i] = [];
        }
        data.infrared.forEach((value, index) => {
          this.dataBuffer.eda_data.infrared[index].push(value);
        });
      }

      if (data.gsr) {
        this.dataBuffer.eda_data.I.push(data.gsr);
      }
    } catch (error) {
      console.log('1---------------');
    }


  }

  /**
   * 处理第三种设备数据
   * @param {object} rawData - 原始数据对象
   */
  handleDevice3Data(rawData) {
    const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    const dataType = parsedData.dataType;
    const data = JSON.parse(parsedData.data);
    console.log(dataType);
    console.log(data);
    // console.log(this.dataBuffer.eeg_data);
    // console.log(this.dataBuffer.eeg_data.acc_x);
    // console.log(this.dataBuffer.eeg_data.acc_y);
    // console.log(this.dataBuffer.eeg_data.acc_z);
    // console.log(this.dataBuffer.eeg_data.ang_x);
    // console.log(this.dataBuffer.eeg_data.ang_y);
    // console.log(this.dataBuffer.eeg_data.ang_z);
    // console.log(this.dataBuffer.eeg_data.PPG);
    try {
      // 根据数据类型添加到不同的缓冲队列
      switch (dataType) {
        case 'ACCELEROMETER':
          try {
            this.dataBuffer.eeg_data.acc_x.push(data[0]);
            this.dataBuffer.eeg_data.acc_y.push(data[1]);
            this.dataBuffer.eeg_data.acc_z.push(data[2]);
          } catch (error) {
            console.log('6---------------');
            console.log(error);
          }

          break;
        case 'EEG':
          try {
            this.dataBuffer.eeg_data.FP1.push(data[0]);
            this.dataBuffer.eeg_data.FP2.push(data[1]);
            this.dataBuffer.eeg_data.T7.push(data[2]);
            this.dataBuffer.eeg_data.T8.push(data[3]);
          } catch (error) {
            console.log('7---------------');
            console.log(error);
          }

          break;
        case 'GYRO':
          try {
            this.dataBuffer.eeg_data.ang_x.push(data[0]);
            this.dataBuffer.eeg_data.ang_y.push(data[1]);
            this.dataBuffer.eeg_data.ang_z.push(data[2]);
          } catch (error) {
            console.log('5---------------');
            console.log(error);
          }

          break;
        case 'HSI_PRECISION':
          // ✅ 正确使用防抖：传递函数引用而非调用结果
          // this.updateStatus(data);
          break;
        case 'PPG':
          try {
            // console.log(this.dataBuffer.eeg_data.PPG);
            // this.dataBuffer.eeg_data.PPG[0].push(data[0]);
            // this.dataBuffer.eeg_data.PPG[1].push(data[1]);
            // this.dataBuffer.eeg_data.PPG[2].push(data[3]);
            // data.forEach((value, index) => {
            //   this.dataBuffer.eeg_data.PPG[index].push(value);
            // });
            // 确保子数组存在
            for (let i = 0; i < 3; i++) {
              if (!this.dataBuffer.eeg_data.PPG[i]) this.dataBuffer.eeg_data.PPG[i] = [];
            }

            data.forEach((value, index) => {
              if (index < 3) { // 确保索引在有效范围内
                this.dataBuffer.eeg_data.PPG[index].push(value);
              }
            });
          } catch (error) {
            console.log('4---------------');
            console.log(error);
          }

          break;
        default:
          console.warn('未知数据类型:', dataType);
      }
    } catch (error) {
      console.log('3---------------');
      console.log(error);
    }
  }
}

// 使用示例
export default BLEDataCollector;