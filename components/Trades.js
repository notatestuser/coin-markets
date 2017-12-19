import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table } from 'antd';
import throttle from 'react-throttle-render';
import styled from 'styled-components';

const RENDER_INTERVAL = 800;

const BuyAmount = styled.span` color: darkgreen; `;
const SellAmount = styled.span` color: darkred; `;

class Trades extends Component {
  static contextTypes = {
    isLoading: PropTypes.bool,
  }

  static propTypes = {
    symbol: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
  }

  static mapStateToProps = ({ trades: parent }, { symbol }) => {
    const trades = parent[symbol.toUpperCase()];
    if (!trades) return { data: [] };
    const data = Object.values(trades);
    return { data };
  }

  render() {
    const columns = [{
      title: 'ID',
      dataIndex: 'id',
      sorter: (a, b) => a.id - b.id,
      sortOrder: 'descend',
    }, {
      title: 'TIME',
      dataIndex: 'timestamp',
      render: timestamp => new Date(timestamp).toLocaleString(),
    }, {
      title: 'AMOUNT',
      dataIndex: 'amount',
      render: amount => !`${amount}`.startsWith('-') ?
        <BuyAmount>{amount}</BuyAmount> :
        <SellAmount>{amount}</SellAmount>,
    }, {
      title: 'PRICE',
      dataIndex: 'price',
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
  Trades.mapStateToProps,
)(
  throttle(RENDER_INTERVAL)(Trades)
);
