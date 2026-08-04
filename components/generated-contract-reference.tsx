import contracts from '../data/generated-contracts.json'

export function GeneratedContractReference({
  kind
}: {
  kind: 'provisioner' | 'property'
}) {
  if (kind === 'provisioner') {
    return (
      <div className="mt-5 overflow-hidden rounded-[0.875rem] border border-[var(--vendra-line)]">
        {contracts.provisioner.endpoints.map(endpoint => (
          <div
            key={`${endpoint.method} ${endpoint.path}`}
            className="grid gap-1 border-t border-[var(--vendra-line)] px-4.5 py-3.5 first:border-t-0 sm:grid-cols-[minmax(0,15rem)_1fr]"
          >
            <code className="font-mono text-[0.8125rem] font-semibold text-[var(--vendra-fg)]">
              {endpoint.method} {endpoint.path}
            </code>
            <span className="text-sm text-[var(--vendra-fg-muted)]">
              Responses: {endpoint.responses.join(', ')}
            </span>
          </div>
        ))}
        <div className="border-t border-[var(--vendra-line)] px-4.5 py-3 text-xs text-[var(--vendra-fg-subtle)]">
          Generated from Provisioner OpenAPI {contracts.provisioner.version}.
        </div>
      </div>
    )
  }

  return (
    <div className="mt-5 rounded-[0.875rem] border border-[var(--vendra-line)] px-4.5 py-3.5 text-sm text-[var(--vendra-fg-muted)]">
      <div>
        <strong className="text-[var(--vendra-fg)]">Required:</strong>{' '}
        <code>{contracts.property.required.join(', ')}</code>
      </div>
      <div className="mt-2">
        <strong className="text-[var(--vendra-fg)]">Optional:</strong>{' '}
        <code>{contracts.property.optional.join(', ')}</code>
      </div>
      <div className="mt-3 text-xs text-[var(--vendra-fg-subtle)]">
        Generated from {contracts.property.id}.
      </div>
    </div>
  )
}
