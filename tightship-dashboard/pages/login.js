import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Authentication from '../components/Authentication/Authentication'
import * as React from "react";
import styled from 'styled-components';
import TextField from '@mui/material/TextField';


const LoginPage = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;


export default function Home() {

  const router = useRouter()

  return (
      <LoginPage>
      <Authentication />
    </LoginPage>
  )
}
