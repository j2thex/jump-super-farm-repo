import { createGlobalStyle } from 'styled-components';
import { Theme } from './theme';

export const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
  body {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0;
  }

  button {
    font-family: inherit;
  }

  * {
    box-sizing: border-box;
  }
`; 