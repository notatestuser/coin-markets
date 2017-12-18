import React, { Component } from 'react';
import withRedux from 'next-redux-wrapper';
import is from 'is';

import ifetch from 'isomorphic-fetch';
import initStore from '../store/initStore';
import Layout from '../components/Layout';
import FlexBox from '../components/FlexBox';
import Heading from '../components/Heading';
import SymbolButton from '../components/SymbolButton';

const API_URL = 'https://api.bitfinex.com/v1/symbols';

class Index extends Component {
  static async getInitialProps() {
    let symbols = [];
    try {
      const res = await ifetch(API_URL, { mode: 'no-cors' });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      symbols = json;
    } catch (err) {
      console.error(`Could not fetch symbols: ${err.message || err}`);
    }
    return { symbols };
  }

  static defaultProps = {
    symbols: [],
  }

  render() {
    const { symbols } = this.props;
    return (
      <Layout>
        <Heading>Choose a Market</Heading>
        <FlexBox>
          {is.empty(symbols) || is.string(symbols) ?
            <div>Could not fetch symbols. Maybe this request was rate limited?</div> :
            symbols.map(symbol => (
              <SymbolButton key={symbol} href={`/trade/${symbol}`}>
                {symbol}
              </SymbolButton>))}
        </FlexBox>
      </Layout>
    );
  }
}

export default withRedux(
  initStore,
  null,
  null,
)(Index);
