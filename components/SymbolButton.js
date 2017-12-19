import React from 'react';
import styled from 'styled-components';
import { Link } from '../routes';

const StyledButton = styled.a`
  background: rgba(0, 0, 0, 0.05);
  cursor: pointer;
  display: block;
  font-size: 2em;
  margin-bottom: 0.7em;
  margin-right: 1em;
  padding: 1em 2em;
  text-align: center;
  text-transform: uppercase;
  width: 200px;

  &,
  &:hover,
  &:active,
  &:visited {
    color: #333;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    text-decoration: underline;
  }
`;

export default props => (
  <Link route={props.route} prefetch={true}>
    <StyledButton>{props.children}</StyledButton>
  </Link>);
