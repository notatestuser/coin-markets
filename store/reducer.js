import actionTypes from '../actions/types';

export const initialState = {
  bfxConnected: false,
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.BFX_SOCKET_CONNECTED:
      return Object.assign({}, state, { bfxConnected: true });
    case actionTypes.BFX_SOCKET_DISCONNECTED:
      return Object.assign({}, state, { bfxConnected: false });
    default: return state;
  }
};

export default reducer;
