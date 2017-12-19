import React from 'react';
import { connect } from 'react-redux';
import bog from 'bog';

export default connect(({ bfxConnected }) => ({ bfxConnected }))(props => (
  <a
    onClick={() => {
      // hacky last minute stuff - unfortunately not store connected
      if (!props.bfxConnected) {
        bog.warn('Not disconnecting when socket is already disconnected.');
        return;
      }
      if (!window.__BFX_WS__) return;
      bog.info('Disconnecting socket');
      window.__BFX_WS__.close();
    }}
    onKeyDown={() => {}}
    role="button"
    tabIndex="-1"
  >
    Disconnect
  </a>
));
