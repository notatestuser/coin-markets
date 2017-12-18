import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { contextTypes } from './BitfinexSocketProvider';
import { socketQueue, socketSubscribed } from '../actions/websocket';

const WAITING_MSG = 'Waiting for the socket to open…';

class BitfinexSubscriptionProvider extends Component {
  static contextTypes = contextTypes;

  static propTypes = {
    id: PropTypes.string.isRequired, // in state as `channel + symbol`
    req: PropTypes.object.isRequired, // e.g. { channel: "ticker", symbol: "tBTCUSD" }
    hideWhileWaiting: PropTypes.bool,
  };

  static defaultProps = {
    hideWhileWaiting: false,
  };

  static mapStateToProps = ({ bfxConnected, bfxSubscriptions }, { id }) => ({
    bfxConnected, bfxSubscriptions, isSubscribed: bfxSubscriptions[id],
  });

  static mapDispatchToProps = (dispatch) => ({
    socketQueue: bindActionCreators(socketQueue, dispatch),
    socketSubscribed: bindActionCreators(socketSubscribed, dispatch),
  });

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
    if (!isSubscribed) return <span>{WAITING_MSG}&ellip;</span>;
    return this.props.children;
  }
}

export default connect(
  BitfinexSubscriptionProvider.mapStateToProps,
  BitfinexSubscriptionProvider.mapDispatchToProps
)(BitfinexSubscriptionProvider);
