import '../styles/globals.css'
import { createGlobalStyle, ThemeProvider as SCThemeProvider } from 'styled-components'
import { theme } from './themes'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { FirebaseAuthProvider } from "../components/Authentication/FirebaseAuthProvider";
import { FirebaseUserInfoProvider } from '../components/Authentication/FirebaseUserInfoProvider';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache()
});


const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
  }
`

export default function App({ Component, pageProps }) {
  
  return (
    
    <div suppressHydrationWarning>
        <FirebaseAuthProvider>
          <FirebaseUserInfoProvider>
          <ApolloProvider client={client}>
            <StyledEngineProvider injectFirst>
              <ThemeProvider theme={theme}>
                <SCThemeProvider theme={theme}>
                  {typeof window === 'undefined' ? null : <Component {...pageProps} />}
                </SCThemeProvider>
              </ThemeProvider>
            </StyledEngineProvider>
          </ApolloProvider>
          </FirebaseUserInfoProvider>
        </FirebaseAuthProvider>
    </div>
    
  )
}
