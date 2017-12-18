import React, { Component } from 'react';
import withRedux from 'next-redux-wrapper';
import is from 'is';
import bog from 'bog';

import fetch from 'isomorphic-fetch';
import initStore from '../store/initStore';
import Layout from '../components/Layout';
import FlexBox from '../components/FlexBox';
import Heading from '../components/Heading';
import SymbolButton from '../components/SymbolButton';

const API_PATH = '/api/bitfinex/v1/symbols';

class IndexPage extends Component {
  static async getInitialProps({ req }) {
    let url;
    let symbols = [];
    if (req) {
      url = `${req.protocol}://${req.get('host')}${API_PATH}`;
    } else {
      url = `${window.location.protocol}//${window.location.host}${API_PATH}`;
    }
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      symbols = json;
    } catch (err) {
      bog.error(`Could not fetch symbols: ${err.message || err}`);
    }
    return { symbols };
  }

  static defaultProps = {
    symbols: [],
  }

  render() {
    const { symbols } = this.props;
    return (
      <Layout url={this.props.url}>
        <Heading>Choose a Market</Heading>
        <FlexBox>
          {is.empty(symbols) || is.string(symbols) ?
            <div>Could not fetch symbols. Was this request rate limited?</div> :
            symbols.map(symbol => (
              <SymbolButton key={symbol} route={`/trade/${symbol}`}>
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
)(IndexPage);
