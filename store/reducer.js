import actionTypes from '../actions/types';
import { getSubscriptionStateId } from '../store/utils';

const ITEM_LIMIT = 25;

export const initialState = {
  // bitfinex state
  bfxConnected: false,
  bfxSendQueue: [],
  bfxSubscriptions: {}, // mapping channel => true
  bfxChannels: {},
  // generic state
  tickers: {},
  books: {},
  trades: {},
};

// books snapshot e.g. [3632,[[0.04199,1,8.96],[0.041982,2,0.76118988],...]]
// books update e.g. [3632,[0.041813,0,1]]

const updateBook = (book, update) => {
  if (!book || !update) return;
  const [price, count, amount] = update;
  // when count > 0 then you have to add or update the price level
  if (count > 0) {
    // if amount > 0 then add/update bids
    if (amount > 0) {
      book.bids[price] = { price, count, amount };
      book.bids[price].key = price;
    // if amount < 0 then add/update asks
    } else if (amount < 0) {
      book.asks[price] = { price, count, amount: Math.abs(amount) };
      book.asks[price].key = price;
    }
  // when count = 0 then you have to delete the price level
  } else if (count === 0) {
    // if amount = 1 then remove from bids
    if (amount === 1) {
      delete book.bids[price];
    // if amount = -1 then remove from asks
    } else if (amount === -1) {
      delete book.asks[price];
    }
  }
};

const updateTrade = (book, update) => {
  if (!book || !update) return;
  const [id, timestamp, amount, price] = update;
  book[id] = {
    key: id, id, timestamp, amount, price,
  };
  const keys = Object.keys(book);
  if (keys.length > ITEM_LIMIT) {
    delete book[keys[0]];
  }
};

const handleSnapshotOrUpdate = (state, payload) => {
  const [chanId] = payload;
  const mapping = state.bfxChannels[chanId];
  if (!mapping) return state; // unknown chanId
  const updateFn = mapping[0] === 'books' ? updateBook : updateTrade;
  const book = state[mapping[0]][mapping[1]];
  const listIdx = typeof payload[1] === 'string' ? 2 : 1; // skip over `te`/`tu`
  if (!payload[listIdx]) return state;
  // snapshot?
  else if (Array.isArray(payload[listIdx][0])) {
    let list = payload[listIdx];
    if (mapping[0] === 'trades') {
      list = list.slice(0, ITEM_LIMIT);
    }
    list.forEach((update) => updateFn(book, update));
  // update?
  } else if (Array.isArray(payload[listIdx])) {
    updateFn(book, payload[listIdx]);
  }
  return Object.assign({}, state);
};

const handleSubscribedBook = (state, payload) => {
  const { chanId, pair } = payload;
  const stateId = getSubscriptionStateId(payload);
  state.bfxSubscriptions[stateId] = chanId;
  state.bfxChannels[chanId] = ['books', pair];
  state.books[pair] = { bids: {}, asks: {} };
  return Object.assign({}, state);
};

const handleSubscribedTrades = (state, payload) => {
  const { chanId, pair } = payload;
  const stateId = getSubscriptionStateId(payload);
  state.bfxSubscriptions[stateId] = chanId;
  state.bfxChannels[chanId] = ['trades', pair];
  state.trades[pair] = { };
  return Object.assign({}, state);
};

const handleSocketReceived = (state, { payload }) => {
  if (Array.isArray(payload)) return handleSnapshotOrUpdate(state, payload);
  switch (payload.event) {
    case 'subscribed':
      switch (payload.channel) {
        case 'book': return handleSubscribedBook(state, payload);
        case 'trades': return handleSubscribedTrades(state, payload);
        default: return state;
      }
    default: return state;
  }
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.BFX_SOCKET_CONNECTED:
      // start from initialState each time the socket connects to keep data safe.
      return Object.assign({}, initialState, {
        bfxConnected: true,
      });
    case actionTypes.BFX_SOCKET_DISCONNECTED:
      return Object.assign({}, state, {
        bfxSocket: null,
        bfxConnected: false,
        bfxSubscriptions: {},
      });
    case actionTypes.BFX_SOCKET_RECEIVED:
      return handleSocketReceived(state, action);
    case actionTypes.BFX_SOCKET_QUEUE:
      state.bfxSendQueue.push(action.payload);
      return Object.assign({}, state);
    case actionTypes.BFX_SOCKET_FLUSH:
      state.bfxSendQueue.length = 0;
      return Object.assign({}, state);
    default:
      return state;
  }
};

export default reducer;
