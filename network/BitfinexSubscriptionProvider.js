import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Spin } from 'antd';

import { socketQueue } from '../actions/websocket';
import { getSubscriptionStateId } from '../store/utils';

class BitfinexSubscriptionProvider extends Component {
  static childContextTypes = {
    isLoading: PropTypes.bool,
  };

  static propTypes = {
    req: PropTypes.object.isRequired, // e.g. { channel: "ticker", symbol: "tBTCUSD" }
    hideWhileWaiting: PropTypes.bool,
  };

  static defaultProps = {
    hideWhileWaiting: false,
  };

  static mapStateToProps = ({ bfxConnected, bfxSubscriptions }, { req }) => ({
    bfxConnected,
    bfxSubscriptions,
    isSubscribed: bfxSubscriptions[getSubscriptionStateId(req)],
  });

  static mapDispatchToProps = (dispatch) => ({
    socketQueue: bindActionCreators(socketQueue, dispatch),
  });

  getChildContext = () => ({ isLoading: !this.props.isSubscribed })

  componentWillMount() {
    this._subscribe();
  }

  componentWillUpdate(nextProps) {
    this._subscribe(nextProps);
  }

  _subscribe(props = this.props) {
    const { bfxConnected, isSubscribed, req } = props;
    if (!bfxConnected || isSubscribed) return;
    this.props.socketQueue(req);
  }

  render() {
    const { hideWhileWaiting, isSubscribed } = this.props;
    if (!hideWhileWaiting) return this.props.children;
    if (!isSubscribed) return <Spin size="large" />;
    return this.props.children;
  }
}

export default connect(
  BitfinexSubscriptionProvider.mapStateToProps,
  BitfinexSubscriptionProvider.mapDispatchToProps
)(BitfinexSubscriptionProvider);
