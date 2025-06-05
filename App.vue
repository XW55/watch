<script>
import { mapState, mapMutations } from 'vuex';
export default {
  onLaunch: function () {
    console.log('App Launch');
  },
  onShow: function () {
    console.log('App Show');
  },
  onHide: function () {
    // uni.setStorageSync('pidian', '');
    // uni.setStorageSync('xindian', '');
    this.setble('');
    this.setxindianble('');
    this.setpidianble('');
    uni.closeBluetoothAdapter({
      success(res) {
        console.log(`关闭蓝牙适配${res}`);
      }
    });
    console.log('App Hide');
  },
  methods: {
    ...mapMutations({
      setble: 'SET_BLE',
      setxindianble: 'SET_XINDIANBLE',
      setpidianble: 'SET_PIDIANBLE'
    })
  }
};
</script>

<style lang="scss">
@import 'static/iocn/iconfont.css';
@import 'node_modules/uview-ui/index.scss';
/*每个页面公共css */
</style>