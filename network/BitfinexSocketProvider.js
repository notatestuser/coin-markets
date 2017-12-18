import { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import bog from 'bog';

import { socketConnected, socketDisconnected, socketReceived, socketFlush } from '../actions/websocket';

const BITFINEX_WS = 'wss://api.bitfinex.com/ws/2';
const CID = 1234;
const ERROR_RECONNECT_DELAY = 1000;

export const contextTypes = {
  bfxSocket: PropTypes.object,
  bfxConnected: PropTypes.bool,
};

class BitfinexSocketProvider extends Component {
  static childContextTypes = contextTypes;

  static mapStateToProps = ({ bfxConnected, bfxSendQueue }) => ({ bfxConnected, bfxSendQueue });

  static mapDispatchToProps = (dispatch) => ({
    socketConnected: bindActionCreators(socketConnected, dispatch),
    socketDisconnected: bindActionCreators(socketDisconnected, dispatch),
    socketReceived: bindActionCreators(socketReceived, dispatch),
    socketFlush: bindActionCreators(socketFlush, dispatch),
  });

  state = {
    closing: false, // do not reconnect when unmounting
  };

  componentDidMount() {
    this._connect();
  }

  componentDidUpdate() {
    this._connect();
    this._processSendQueue();
  }

  componentWillUnmount() {
    if (!this._socket) return;
    this.setState({ closing: true }, () => {
      this._socket && this._socket.close();
    });
  }

  getChildContext() {
    const { bfxConnected } = this.props;
    return { bfxConnected, bfxSocket: this._socket };
  }

  _connect() {
    if (!window.WebSocket) return; // server-side render?
    if (this.state.closing) return; // component unmounting
    if (this._socket && this._socket.readyState === 1) return; // connected
    if (this._socket && !this._socket.readyState) this._socket.close();
    bog.info('WebSocket connecting');
    const ws = (this._socket = new WebSocket(BITFINEX_WS));
    ws.onmessage = ev => {
      bog.info(ev.data);
      const obj = JSON.parse(ev.data);
      if (obj.event === 'pong') {
        this.props.socketConnected();
      } else {
        this.props.socketReceived(obj);
      }
    };
    ws.onopen = () => {
      bog.info('WebSocket connected');
      this._send({
        event: 'ping',
        cid: CID,
      });
    };
    ws.onerror = err => {
      bog.error('WebSocket error', err);
      ws.close();
      this.props.socketDisconnected();
      this._scheduleReconnect();
    };
    ws.onclose = () => {
      this._socket = null;
      this._scheduleReconnect();
    };
  }

  _scheduleReconnect() {
    if (this.state.closing) return;
    setTimeout(() => {
      this._connect();
    }, ERROR_RECONNECT_DELAY);
  }

  _processSendQueue() {
    const { bfxSendQueue } = this.props;
    bfxSendQueue.forEach((obj) => {
      this._send(obj);
    });
    this.props.socketFlush();
  }

  _send(obj) {
    if (!this._socket || this._socket.readyState !== 1) return; // connected
    this._socket.send(JSON.stringify(obj));
  }

  render() {
    return this.props.children;
  }
}

export default connect(
  BitfinexSocketProvider.mapStateToProps,
  BitfinexSocketProvider.mapDispatchToProps
)(BitfinexSocketProvider);
