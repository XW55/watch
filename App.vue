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
    this.setble('');
    // uni.closeBluetoothAdapter({
    //   success(res) {
    //     console.log(`关闭蓝牙适配${res}`);
    //   }
    // });
    console.log('App Hide');
  },
  methods: {
    ...mapMutations({
      setble: 'SET_BLE'
    })
  }
};
</script>

<style lang="scss">
@import 'node_modules/uview-ui/index.scss';
/*每个页面公共css */
</style>
