import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
      <body>
        <Head />

          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
