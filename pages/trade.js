import React, { Component } from 'react';
import withRedux from 'next-redux-wrapper';
import dynamic from 'next/dynamic';

import initStore from '../store/initStore';
import Layout from '../components/Layout';
import FlexBox from '../components/FlexBox';
import Heading from '../components/Heading';
import OrderBook from '../components/OrderBook';
import Trades from '../components/Trades';
import BitfinexSubscriptionProvider from '../network/BitfinexSubscriptionProvider';

const BitfinexSocketProvider = dynamic(import('../network/BitfinexSocketProvider'), {
  ssr: false,
});

const FREQ = 'F1';

class TradePage extends Component {
  static async getInitialProps({ query }) {
    const symbol = query.symbol.toUpperCase();
    return { symbol };
  }

  render() {
    const { symbol } = this.props;
    const ordersReq = {
      event: 'subscribe',
      channel: 'book',
      symbol,
      freq: FREQ,
    };
    const tradesReq = {
      event: 'subscribe',
      channel: 'trades',
      symbol,
      freq: FREQ,
    };
    return (
      <Layout breadcrumb={<strong>Viewing Market: {symbol}</strong>} url={this.props.url}>
        <BitfinexSocketProvider>
          <FlexBox justify="space-around">
            <BitfinexSubscriptionProvider req={ordersReq}>
              <FlexBox basis="350px" direction="column">
                <Heading uppercase={true}>
                  Bid Orders
                </Heading>
                <OrderBook symbol={symbol} type="bids" />
              </FlexBox>
              <FlexBox basis="350px" direction="column">
                <Heading uppercase={true}>
                  Ask Orders
                </Heading>
                <OrderBook symbol={symbol} type="asks" />
              </FlexBox>
            </BitfinexSubscriptionProvider>
            <FlexBox basis="450px">
              <BitfinexSubscriptionProvider req={tradesReq}>
                <FlexBox basis="450px" direction="column">
                  <Heading uppercase={true}>
                    Trades
                  </Heading>
                  <Trades symbol={symbol} />
                </FlexBox>
              </BitfinexSubscriptionProvider>
            </FlexBox>
          </FlexBox>
        </BitfinexSocketProvider>
      </Layout>);
  }
}

export default withRedux(
  initStore,
)(TradePage);
