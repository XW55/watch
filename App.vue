<script>
import { wugandenglu } from '@/api/loginSign/index.js';
import { mapState, mapMutations } from 'vuex';
export default {
  onLaunch: function () {
    console.log('App Launch');
  },
  onShow: function () {
    console.log('App Show');
    this.wugandengluapp();
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
    }),
    wugandengluapp() {
      wugandenglu()
        .then((res) => {
          console.log(res);
          if (res.data.code == 200) {
            // uni.showToast({
            //   title: '登录成功',
            //   icon: 'none'
            // });
            let token = res.data.token;
            uni.setStorageSync('token', token);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
};
</script>

<style lang="scss">
@import 'static/iocn/iconfont.css';
@import 'node_modules/uview-ui/index.scss';
page {
  height: 100%;
  box-sizing: border-box;
  // background-color: pink;
}
.boxShadow {
  box-shadow: 0 2.5px 4px 0 rgba(0, 0, 0, 0.1), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}
/*每个页面公共css */
</style>