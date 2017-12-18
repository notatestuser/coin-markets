import { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import bog from 'bog';

import { socketConnected, socketDisconnected } from '../actions/websocket';

const BITFINEX_WS = 'wss://api.bitfinex.com/ws/2';
const CID = 1234;
const ERROR_RECONNECT_DELAY = 1000;

export const contextTypes = {
  bfxSocket: PropTypes.object,
  bfxConnected: PropTypes.bool,
};

class BitfinexSocketProvider extends Component {
  static childContextTypes = contextTypes

  static mapStateToProps({ bfxConnected }) {
    return { bfxConnected };
  }

  static mapDispatchToProps(dispatch) {
    return {
      socketConnected: bindActionCreators(socketConnected, dispatch),
      socketDisconnected: bindActionCreators(socketDisconnected, dispatch),
    };
  }

  componentDidMount() {
    this._connect();
  }

  componentDidUpdate() {
    this._connect();
  }

  getChildContext() {
    const { bfxConnected } = this.props;
    return { bfxConnected, bfxSocket: this._socket };
  }

  _connect() {
    if (!window.WebSocket) return; // server-side render?
    if (this._socket && this._socket.readyState === 1) return; // connected
    if (this._socket && !this._socket.readyState) this._socket.close();
    const ws = (this._socket = new WebSocket(BITFINEX_WS));
    ws.onmessage = ev => {
      bog.info(ev.data);
      const obj = JSON.parse(ev.data);
      if (obj.event === 'pong') {
        this.props.socketConnected();
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
      setTimeout(() => {
        this._connect();
      }, ERROR_RECONNECT_DELAY);
    };
    ws.onclose = () => {
      this._socket = null;
    };
  }

  _send(data) {
    if (!this._socket || this._socket.readyState !== 1) return; // connected
    this._socket.send(JSON.stringify(data));
  }

  render() {
    return this.props.children;
  }
}

export default connect(
  BitfinexSocketProvider.mapStateToProps,
  BitfinexSocketProvider.mapDispatchToProps
)(BitfinexSocketProvider);
