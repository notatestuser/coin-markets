import actionTypes from '../actions/types';

export const initialState = {
  loading: 0,
  symbols: [],
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    default: return state;
  }
};

export default reducer;
