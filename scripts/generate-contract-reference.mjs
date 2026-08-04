#!/usr/bin/env node
/** Generates exact endpoint and property-field summaries from sibling contracts. */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ecosystem = process.env.VENDRA_ECOSYSTEM_DIR ?? resolve(root, '..')
const output = resolve(root, 'data/generated-contracts.json')
const openapiPath = resolve(ecosystem, 'vendra-controller/api/openapi.yaml')
const schemaPath = resolve(
  ecosystem,
  'vendra-storefront-florist/properties/schema.json'
)

if (!existsSync(openapiPath) || !existsSync(schemaPath)) {
  console.log(
    '✓ docs: kept committed contract snapshot; sibling sources unavailable'
  )
  process.exit(0)
}

const yaml = readFileSync(openapiPath, 'utf8')
const version = yaml.match(/^info:.*version:\s*([^,}]+)/m)?.[1]?.trim()
if (!version) throw new Error('Could not parse provisioner API version')

const endpoints = []
let endpoint
let operation
for (const line of yaml.split('\n')) {
  const path = line.match(/^ {2}(\/\S+):$/)?.[1]
  if (path) {
    endpoint = path
    operation = undefined
    continue
  }
  const method = line.match(/^ {4}(get|post|put|patch|delete):$/)?.[1]
  if (endpoint && method) {
    operation = { method: method.toUpperCase(), path: endpoint, responses: [] }
    endpoints.push(operation)
    continue
  }
  const response = line.match(/^ {8}"(\d{3})":/)?.[1]
  if (operation && response) operation.responses.push(response)
}
if (!endpoints.length) throw new Error('Could not parse provisioner endpoints')

const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))
const required = schema.required ?? []
const requiredSet = new Set(required)
const optional = Object.keys(schema.properties ?? {}).filter(
  field => !requiredSet.has(field)
)

writeFileSync(
  output,
  `${JSON.stringify(
    {
      provisioner: { version, endpoints },
      property: { id: schema.$id, required, optional }
    },
    null,
    2
  )}\n`
)
console.log('✓ docs: generated API and property contract reference')
