export const getSubscriptionStateId = ({ channel, symbol, pair }) =>
  channel + (pair || symbol);

export default { getSubscriptionStateId };
