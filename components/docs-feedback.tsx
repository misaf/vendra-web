'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'nextra/components'

const issuesUrl = 'https://github.com/misaf/vendra-web/issues/new'

function issueHref(title: string, body: string, labels = 'documentation') {
  const query = new URLSearchParams({ title, body, labels })
  return `${issuesUrl}?${query.toString()}`
}

/** Opt-in reporting for Pagefind queries that return no results. */
export function DocsSearch() {
  const [query, setQuery] = useState('')
  const pathname = usePathname()
  const trimmed = query.trim()
  const href = issueHref(
    `[docs gap] ${trimmed || 'Missing search topic'}`,
    `Search query: ${trimmed || '(not captured)'}\n\nPage searched from: ${pathname}\n\nWhat did you expect to find?\n`,
    'documentation,docs-gap'
  )

  return (
    <Search
      onSearch={setQuery}
      emptyResult={
        <span>
          No results found.{' '}
          <a href={href} target="_blank" rel="noreferrer">
            Report this missing topic
          </a>
          .
        </span>
      }
    />
  )
}
