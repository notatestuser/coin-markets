import styled from 'styled-components';

export default styled.h2`
  margin-bottom: 1.5em;
  text-transform: ${({ uppercase }) => uppercase ? 'uppercase' : ''};
`;
