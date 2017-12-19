import React, { Component } from 'react';
import withRedux from 'next-redux-wrapper';
import dynamic from 'next/dynamic';
import styled from 'styled-components';

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

const PaddedFlexBox = styled(FlexBox)` padding: 0 15px; `;

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
        <FlexBox justify="space-between" padding="0 10px">
          <PaddedFlexBox basis="30%" direction="column">
            <Heading uppercase={true}>
              Ticker
            </Heading>

          </PaddedFlexBox>
        </FlexBox>
        <BitfinexSocketProvider>
          <FlexBox justify="space-between" padding="0 10px">
            <BitfinexSubscriptionProvider req={ordersReq}>
              <PaddedFlexBox basis="30%" direction="column">
                <Heading uppercase={true}>
                  Bid Orders
                </Heading>
                <OrderBook symbol={symbol} type="bids" />
              </PaddedFlexBox>
              <PaddedFlexBox basis="30%" direction="column">
                <Heading uppercase={true}>
                  Ask Orders
                </Heading>
                <OrderBook symbol={symbol} type="asks" />
              </PaddedFlexBox>
            </BitfinexSubscriptionProvider>
            <PaddedFlexBox basis="40%">
              <BitfinexSubscriptionProvider req={tradesReq}>
                <FlexBox basis="100%" direction="column">
                  <Heading uppercase={true}>
                    Trades
                  </Heading>
                  <Trades symbol={symbol} />
                </FlexBox>
              </BitfinexSubscriptionProvider>
            </PaddedFlexBox>
          </FlexBox>
        </BitfinexSocketProvider>
      </Layout>);
  }
}

export default withRedux(
  initStore,
)(TradePage);
