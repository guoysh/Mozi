import React, { Component } from 'react';
import { BackHandler, ToastAndroid,Platform,Alert } from "react-native";
import { connect } from 'react-redux';
import {
  reduxifyNavigator,
} from 'react-navigation-redux-helpers';
import { NavigationActions } from 'react-navigation';
import JPushModule from 'jpush-react-native';
import Routers from './routers/app';


@connect(state => ({ nav: state.nav }))
export default class AppNavigationState extends Component {
  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
    if (Platform.OS === 'android') {
    // 通知 JPushModule 初始化完成，发送缓存事件。
         JPushModule.notifyJSDidLoad((resultCode) => {});
    }
    // 接收自定义消息
    JPushModule.addReceiveCustomMsgListener((message) => {
      this.setState({pushMsg: message});
    });
    // 接收推送通知
    JPushModule.addReceiveNotificationListener((message) => {
      console.log("receive notification: " + message);
    });
    // 打开通知
    JPushModule.addReceiveOpenNotificationListener((map) => {
      console.log("Opening notification!");
      !!this.root && this.root.props.navigation.navigate('Gong')
    });

  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
    this.lastBackPressed = null

    JPushModule.removeReceiveCustomMsgListener();
    JPushModule.removeReceiveNotificationListener();
  }

  onBackPress = () => {
    const { dispatch, nav } = this.props;
    if (nav.index === 0) {
      if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
        return false;
      }
      this.lastBackPressed = Date.now();
      ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
    }
    dispatch(NavigationActions.back());
    return true;
  };

  render() {

    let AppWithNavigationState = reduxifyNavigator(Routers, 'root');

    return (
      <AppWithNavigationState
        ref={ref => {
          this.root = ref;
        }}
      />
    );
  }
}
