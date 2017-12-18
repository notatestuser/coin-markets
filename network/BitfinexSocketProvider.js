import { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import bog from 'bog';

import {
  socketConnected,
  socketDisconnected,
  socketReceived,
  socketFlush,
} from '../actions/websocket';

const BITFINEX_WS = 'wss://api.bitfinex.com/ws/2';
const CID = 1234;
const ERROR_RECONNECT_DELAY = 1000;

export const contextTypes = {
  bfxSocket: PropTypes.object,
  bfxConnected: PropTypes.bool,
};

// unfortunate hacks made necessary by next's server-side state serialisation. revisit.
const _window = typeof window === 'undefined' ? {} : window;
const getSocket = () => _window.__BFX_WS__;
const setSocket = ws => { _window.__BFX_WS__ = ws; };

class BitfinexSocketProvider extends Component {
  static childContextTypes = contextTypes;

  static mapStateToProps = ({ bfxConnected, bfxSendQueue }) => ({ bfxConnected, bfxSendQueue });

  static mapDispatchToProps = dispatch => ({
    socketConnected: bindActionCreators(socketConnected, dispatch),
    socketDisconnected: bindActionCreators(socketDisconnected, dispatch),
    socketReceived: bindActionCreators(socketReceived, dispatch),
    socketFlush: bindActionCreators(socketFlush, dispatch),
  });

  // do not reconnect when unmounting
  state = { closing: false }

  componentDidMount() {
    this._connect();
    this._processSendQueue();
  }

  componentDidUpdate() {
    this._connect();
    this._processSendQueue();
  }

  componentWillUnmount() {
    if (!getSocket()) return;
    this.setState({ closing: true }, () => {
      getSocket() && getSocket().close();
    });
  }

  getChildContext() {
    const { bfxConnected } = this.props;
    return { bfxConnected, bfxSocket: getSocket() };
  }

  _connect() {
    if (typeof window === 'undefined' || !window.WebSocket) return; // server-side render?
    if (this.state.closing) return; // component unmounting
    if (getSocket() && getSocket().readyState === 1) return; // connected
    if (getSocket() && !getSocket().readyState) getSocket().close();
    bog.info('WebSocket connecting');
    const ws = new WebSocket(BITFINEX_WS);
    setSocket(ws);
    ws.onmessage = ev => {
      // bog.info('Data received:', ev.data);
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
      setSocket(null);
      this.props.socketDisconnected();
      this._scheduleReconnect();
    };
  }

  _scheduleReconnect() {
    if (this.state.closing) return;
    bog.info('Scheduling socket reconnect');
    setTimeout(() => {
      this._connect();
    }, ERROR_RECONNECT_DELAY);
  }

  _processSendQueue() {
    const { bfxSendQueue } = this.props;
    bfxSendQueue.forEach(obj => {
      bog.info('WebSocket sending', obj);
      this._send(obj);
    });
    this.props.socketFlush();
  }

  _send(obj) {
    if (!getSocket() || getSocket().readyState !== 1) return; // connected
    getSocket().send(JSON.stringify(obj));
  }

  render() {
    return this.props.children;
  }
}

export default connect(
  BitfinexSocketProvider.mapStateToProps,
  BitfinexSocketProvider.mapDispatchToProps
)(BitfinexSocketProvider);
