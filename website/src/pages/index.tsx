import React from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import Layout from '@theme/Layout'
import style from './index.module.css'
import { CurrencyInput } from '@site/src/components/Inputs'

export default function Home(): JSX.Element {
  return (
    <Layout
      title={`Home`}
      description="The best way to build formatted inputs with React"
    >
      <header className={style.header}>
        <div className={style.headerContainer}>
          <h1>React Formatted Input Hook</h1>
          <h2 className={style.tagline}>
            Fully featured formatted inputs, with no compromise on UX.
          </h2>
          <CurrencyInput
            defaultOptions={{ currency: 'USD', locales: 'en-US' }}
            defaultValue={1234}
            simple
          />
          <Link className={style.cta} to="/docs/getting-started">
            Getting started →
          </Link>
        </div>
      </header>
      <main className="columns">
        <article>
          <h2>Headless</h2>
          <p>
            Works with any library, we do the heavy lifting, you do the
            rendering.
            <code>{'<input />'}</code>.
          </p>
        </article>
        <article>
          <h2>Top UX</h2>
          <p>
            Simply the best way to do formatted inputs for your users, no wanky
            interactions.
          </p>
          <Link to="/docs/under-the-hood">See why →</Link>
        </article>
        <article>
          <h2>Customizable</h2>
          <p>
            Low level API to support any use cases, high-level formatters for
            common needs.
          </p>
        </article>
      </main>
    </Layout>
  )
}
