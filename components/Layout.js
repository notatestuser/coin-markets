import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';

import {
  Breadcrumb,
  LocaleProvider,
  Layout,
  Menu,
} from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';

import { Link } from '../routes';
import ConnectionStatus from '../components/ConnectionStatus';
import DisconnectButton from '../components/DisconnectButton';

const {
  Header,
  Footer,
  Content,
} = Layout;

const Logo = styled.div`
  border-radius: 6px;
  color: #fcfcfc;
  cursor: pointer;
  float: left;
  font-size: 2em;
  height: 31px;
  padding: 0 30px 0 22px;

  & a,
  & a:hover,
  & a:active,
  & a:visited {
    color: inherit;
  }

  & a:hover {
    text-decoration: underline;
  }
`;

export default ({ breadcrumb, url, children }) => (
  <div>
    <Head>
      <title>Coin Markets</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <link
        rel="stylesheet"
        href="//cdn.jsdelivr.net/npm/antd@2.13.11/dist/antd.min.css"
      />
    </Head>
    <LocaleProvider locale={enUS}>
      <Layout className="layout">
        <Header>
          <Logo>
            <Link route="/" prefetch={true}>
              <a>Coin Markets</a>
            </Link>
          </Logo>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[url.pathname.endsWith('/') ? '1' : '2']}
            style={{ lineHeight: '64px' }}
          >
            <Menu.Item key="1">
              <Link route="/" prefetch={true}>
                <a>Markets</a>
              </Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link route="/trade/btcusd">
                <a>Trade View</a>
              </Link>
            </Menu.Item>
            <Menu.Item key="4" style={{ float: 'right' }}>
              {/* Hacky last minute force disconnect. Sorry! */}
              <DisconnectButton />
            </Menu.Item>
            <Menu.Item key="3" style={{ float: 'right' }} disabled={true}>
              <ConnectionStatus stateKey="bfxConnected" />
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '35px 50px' }}>
          {breadcrumb ?
            <Breadcrumb style={{ margin: '0 0 20px' }}>
              <Breadcrumb.Item>{breadcrumb}</Breadcrumb.Item>
            </Breadcrumb> : null}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: '#fff',
              padding: 24,
              minHeight: 280,
            }}
          >
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          © 2017 Luke Plaster &lt;me@lukep.org&gt;
        </Footer>
      </Layout>
    </LocaleProvider>
  </div>
);
