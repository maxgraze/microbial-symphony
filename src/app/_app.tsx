import React from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import Layout from "./layout"; // Adjust the import path according to your file structure
import "../styles/globals.css"; // Import global styles

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Microbial Symphony</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://use.typekit.net/zur3vau.css" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;
