import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';

import {
  LocaleProvider,
  Layout,
  Menu,
} from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';

import BitfinexSocketProvider from '../network/BitfinexSocketProvider';

const {
  Header,
  Footer,
  Content,
} = Layout;

const Logo = styled.div`
  border-radius: 6px;
  color: white;
  cursor: pointer;
  float: left;
  font-size: 2em;
  height: 31px;
  padding: 0 30px 0 22px;
`;

export default ({ children }) => (
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
    <style jsx global>
      {`body {
        }`}
    </style>
    <BitfinexSocketProvider>
      <LocaleProvider locale={enUS}>
        <Layout className="layout">
          <Header>
            <Logo onClick={() => { window.location.href = '/'; }}>
              Coin Markets
            </Logo>
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['1']}
              style={{ lineHeight: '64px' }}
            >
              <Menu.Item key="1">
                <a href="/">Markets</a>
              </Menu.Item>
              <Menu.Item key="2">
                <a href="/trade/btcusd">Trade View</a>
              </Menu.Item>
              <Menu.Item key="3" style={{ float: 'right' }}>
                Force Disconnect WebSocket
              </Menu.Item>
            </Menu>
          </Header>
          <Content style={{ padding: '35px 50px' }}>
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
    </BitfinexSocketProvider>
  </div>
);
