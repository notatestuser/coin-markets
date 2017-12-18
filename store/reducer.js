import actionTypes from '../actions/types';

export const initialState = {
  // bitfinex state
  bfxConnected: false,
  bfxSendQueue: [],
  bfxSubscriptions: {}, // mapping channel => true
  // generic state
  tickers: {},
  books: {},
  trades: {},
};

const handleSocketReceived = (state, { payload }) => {
  switch (payload.event) {
    case 'subscribed':
      state[payload.channel + (payload.symbol || payload.pair)] = true;
      return Object.assign({}, state);
    default: return state;
  }
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.BFX_SOCKET_CONNECTED:
      return Object.assign({}, state, { bfxConnected: true, bfxSubscriptions: {} });
    case actionTypes.BFX_SOCKET_DISCONNECTED:
      return Object.assign({}, state, { bfxConnected: false, bfxSubscriptions: {} });
    case actionTypes.BFX_SOCKET_RECEIVED:
      return handleSocketReceived(state, action);
    case actionTypes.BFX_SOCKET_QUEUE:
      state.bfxSendQueue.push(action.payload);
      return Object.assign({}, state);
    case actionTypes.BFX_SOCKET_FLUSH:
      state.bfxSendQueue.length = 0;
      return Object.assign({}, state);
    default: return state;
  }
};

export default reducer;
