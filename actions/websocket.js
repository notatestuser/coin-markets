import actionTypes from './types';

const {
  BFX_SOCKET_CONNECTED,
  BFX_SOCKET_DISCONNECTED,
  FORCE_SOCKET_DISCONNECT,
} = actionTypes;

export const socketConnected = () => dispatch => dispatch({ type: BFX_SOCKET_CONNECTED });

export const socketDisconnected = () => dispatch => dispatch({ type: BFX_SOCKET_DISCONNECTED });

export const forceDisconnect = () => dispatch => dispatch({ type: FORCE_SOCKET_DISCONNECT });
