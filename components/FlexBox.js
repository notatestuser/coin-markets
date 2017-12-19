import styled from 'styled-components';

export default styled.div`
  display: flex;
  flex-basis: ${({ basis }) => basis};
  flex-direction: ${({ direction }) => direction};
  flex-wrap: wrap;
  justify-content: ${({ justify }) => justify};
  min-width: 256px;
  padding: ${({ padding }) => padding};
`;
