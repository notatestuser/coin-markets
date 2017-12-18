import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table } from 'antd';
import throttle from 'react-throttle-render';
import styled from 'styled-components';

const RENDER_INTERVAL = 800;

const BuyAmount = styled.span` color: darkgreen; `;
const SellAmount = styled.span` color: darkred; `;

class OrderBook extends Component {
  static contextTypes = {
    isLoading: PropTypes.bool,
  }

  static propTypes = {
    symbol: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['bids', 'asks']),
    data: PropTypes.array.isRequired,
  }

  static defaultProps = {
    type: 'bids',
  }

  static mapStateToProps = ({ books }, { symbol, type }) => {
    const book = books[symbol.toUpperCase()];
    if (!book) return { data: [] };
    const data = Object.values(book[type]);
    return { data };
  }

  render() {
    const { type } = this.props;
    const columns = [{
      title: 'PRICE',
      dataIndex: 'price',
      sorter: (a, b) => a.price - b.price,
      sortOrder: 'ascend',
    }, {
      title: 'AMOUNT',
      dataIndex: 'amount',
      render: amount => type === 'bids' ?
        <BuyAmount>{amount}</BuyAmount> :
        <SellAmount>{amount}</SellAmount>,
    }, {
      title: 'COUNT',
      dataIndex: 'count',
    }];
    return (
      <Table
        bordered={true}
        columns={columns}
        dataSource={this.props.data}
        loading={this.context.isLoading}
        pagination={false}
        size="small"
      />
    );
  }
}

export default connect(
  OrderBook.mapStateToProps,
)(
  throttle(RENDER_INTERVAL)(OrderBook)
);
