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

// ticker update e.g. [4,[768,277.00968832,768.01,430.58985595,...]]

const updateTicker = (book, update) => {
  if (!book || !update) return;
  const [
    bid,
    bidSize,
    ask,
    askSize,
    dailyChange,
    dailyChangePerc,
    lastPrice,
    volume,
    high,
    low,
  ] = update;
  Object.assign(book, {
    bid, bidSize, ask, askSize, dailyChange, dailyChangePerc, lastPrice, volume, high, low,
  });
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
  let updateFn;
  switch (mapping[0]) {
    case 'books': updateFn = updateBook; break;
    case 'trades': updateFn = updateTrade; break;
    case 'tickers': updateFn = updateTicker; break;
    default: throw new Error('Unknown channel type');
  }
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
  state[mapping[0]][mapping[1]] = Object.assign({}, book); // re-render connected components
  return Object.assign({}, state);
};

// {"event":"subscribed","channel":"ticker","chanId":4,"symbol":"tETHUSD","pair":"ETHUSD"}
// [4,[768,277.00968832,768.01,430.58985595,58.18,0.082,768,447505.90550396,798.9,660]]

const handleSubscribedTicker = (state, payload) => {
  const { chanId, pair } = payload;
  const stateId = getSubscriptionStateId(payload);
  state.bfxSubscriptions[stateId] = chanId;
  state.bfxChannels[chanId] = ['tickers', pair];
  state.tickers[pair] = { };
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
        case 'ticker': return handleSubscribedTicker(state, payload);
        case 'book': return handleSubscribedBook(state, payload);
        case 'trades': return handleSubscribedTrades(state, payload);
        default: return Object.assign({}, state);
      }
    default: return Object.assign({}, state);
  }
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.BFX_SOCKET_CONNECTED:
      // start from initialState each time the socket connects to keep data safe.
      return Object.assign({}, state, {
        bfxConnected: true,
        bfxSubscriptions: {},
        tickers: {},
        books: {},
        trades: {},
      });
    case actionTypes.BFX_SOCKET_DISCONNECTED:
      return Object.assign({}, state, {
        bfxConnected: false,
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
