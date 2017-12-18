import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Cluster, Clear } from 'grommet-icons';
import styled from 'styled-components';

const iconTheme = (connected) => ({
  icon: {
    color: connected ? 'white' : 'lightsalmon',
  },
});

const Wrapper = styled.span`
  color: ${({ connected }) => connected ? 'white' : 'lightsalmon'};

  & svg {
    width: 10px;
    height: 10px;
    margin-right: 3px;
  }
`;

class ConnectionStatus extends Component {
  static propTypes = {
    stateKey: PropTypes.string.isRequired,
  }

  static mapStateToProps = (state, { stateKey }) => ({ connected: !!state[stateKey] });

  render() {
    const { connected } = this.props;
    if (connected) {
      return (
        <Wrapper connected={true}>
          <Cluster theme={iconTheme(true)} /> Socket Connected
        </Wrapper>
      );
    }
    return (
      <Wrapper>
        <Clear theme={iconTheme(false)} /> Socket Disconnected
      </Wrapper>
    );
  }
}

export default connect(
  ConnectionStatus.mapStateToProps,
  null
)(ConnectionStatus);
