import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Spin } from 'antd';
import throttle from 'react-throttle-render';
import styled from 'styled-components';

const RENDER_INTERVAL = 800;
const NAME_MAP = {
  'bid': 'Bid',
  'bidSize': 'Bid Size',
  'ask': 'Ask',
  'askSize': 'Ask Size',
  'dailyChange': 'Daily Change',
  'dailyChangePerc': 'Daily Change %',
  'lastPrice': 'Last Price',
  'volume': 'Volume',
  'high': 'High',
  'low': 'Low',
};

const StyledTicker = styled.div`
  & span:not(:last-child):after {
    content: ', ';
  }
`;

class Ticker extends Component {
  static contextTypes = {
    isLoading: PropTypes.bool,
  }

  static propTypes = {
    symbol: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
  }

  static mapStateToProps = ({ tickers }, { symbol }) => {
    const ticker = tickers[symbol.toUpperCase()];
    if (!ticker) return { data: {} };
    return { data: ticker };
  }

  render() {
    if (this.context.isLoading) return <Spin size="large" />;
    const { data } = this.props;
    return (
      <StyledTicker style={{ marginBottom: '40px' }}>
        {Object.keys(data).map(key => <span key={key}>{NAME_MAP[key]}: {data[key]}</span>)}
      </StyledTicker>);
  }
}

export default connect(
  Ticker.mapStateToProps,
)(
  throttle(RENDER_INTERVAL)(Ticker)
);
