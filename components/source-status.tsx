import revisions from '../data/source-revisions.json'

const repositories = {
  web: { label: 'Web docs' },
  controller: { label: 'Controller' },
  platform: { label: 'Platform' },
  storefront: { label: 'Storefront' }
} as const

export type SourceRepository = keyof typeof repositories

/** Static build-time snapshot for contract-sensitive documentation. */
export function SourceStatus({ sources }: { sources: SourceRepository[] }) {
  return (
    <aside className="mt-8 rounded-xl border border-[var(--vendra-line)] bg-[var(--vendra-surface-raised)] px-4 py-3 text-sm text-[var(--vendra-fg-muted)]">
      <div className="font-semibold text-[var(--vendra-fg)]">
        Verified source snapshot
      </div>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
        {sources.map(source => (
          <span key={source}>
            {repositories[source].label}: {revisions[source]}
          </span>
        ))}
      </div>
      <p className="mt-2 mb-0 text-xs leading-5">
        These revisions identify the sources present when this site was built;
        they are not a production compatibility guarantee.
      </p>
    </aside>
  )
}
