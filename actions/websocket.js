import actionTypes from './types';

const {
  BFX_SOCKET_CONNECTED,
  BFX_SOCKET_DISCONNECTED,
  BFX_SOCKET_RECEIVED,
  BFX_SOCKET_QUEUE,
  BFX_SOCKET_FLUSH,
  BFX_SOCKET_DISCONNECT,
} = actionTypes;

export const socketConnected = () => dispatch =>
  dispatch({ type: BFX_SOCKET_CONNECTED });

export const socketDisconnected = () => dispatch =>
  dispatch({ type: BFX_SOCKET_DISCONNECTED });

export const socketReceived = payload => dispatch =>
  dispatch({ type: BFX_SOCKET_RECEIVED, payload });

export const socketQueue = payload => dispatch =>
  dispatch({ type: BFX_SOCKET_QUEUE, payload });

export const socketFlush = payload => dispatch =>
  dispatch({ type: BFX_SOCKET_FLUSH, payload });

export const socketDisconnect = () => dispatch =>
  dispatch({ type: BFX_SOCKET_DISCONNECT });
