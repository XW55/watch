<template>
  <view>
    {{ data }}
  </view>
</template>

<script>
// import * as tool from '@/utils/config.js';
export default {
  data() {
    return {
      data: {}
    };
  },
  onLoad() {
    // 示例数据
    const hexString =
      '00AA00CC200000333100010080D6330884E2741083253F18812C3E2080F592288627DA3084EBD1388154792080F592288627DA3084EBD138815479FF' +
      'F7FFCA080C';
    // this.data = tool.parseSensorData(hexString);
    console.log('解析结果：', data);
  },
  methods: {}
};
</script>
