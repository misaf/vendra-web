#!/usr/bin/env node
/** Generates the static source snapshot rendered on contract-sensitive pages. */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const directories = {
  web: root,
  controller: resolve(root, '../vendra-controller'),
  platform: resolve(root, '../vendra-platform'),
  storefront: resolve(root, '../vendra-storefront-florist')
}

const revisions = Object.fromEntries(
  Object.entries(directories).map(([name, directory]) => {
    try {
      const value = execFileSync('git', ['describe', '--tags', '--always'], {
        cwd: directory,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      }).trim()
      return [name, value || 'source unavailable']
    } catch {
      return [name, 'source unavailable']
    }
  })
)

writeFileSync(
  resolve(root, 'data/source-revisions.json'),
  `${JSON.stringify(revisions, null, 2)}\n`
)
console.log('✓ docs: generated source revision snapshot')
