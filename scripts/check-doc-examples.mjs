#!/usr/bin/env node
/** Validates contract-sensitive examples on the copy-ready examples page. */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ecosystem = process.env.VENDRA_ECOSYSTEM_DIR ?? resolve(root, '..')
const pagePath = resolve(root, 'app/docs/getting-started/examples/page.mdx')
const page = readFileSync(pagePath, 'utf8')
const problems = []

function block(language, filename) {
  const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = page.match(
    new RegExp(
      '```' +
        language +
        '[^\\n]*filename="' +
        escaped +
        '"[^\\n]*\\n([\\s\\S]*?)```'
    )
  )
  if (!match) throw new Error(`Missing ${filename} example`)
  return match[1]
}

function json(filename) {
  try {
    return JSON.parse(block('json', filename))
  } catch (error) {
    problems.push(`${filename} is not valid JSON: ${error.message}`)
    return {}
  }
}

const property = json('property.example.json')
const response = json('storefront-response.example.json')
const schemaPath = resolve(
  ecosystem,
  'vendra-storefront-florist/properties/schema.json'
)
if (existsSync(schemaPath)) {
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))
  for (const key of schema.required ?? []) {
    if (!(key in property)) problems.push(`property.example.json omits ${key}`)
  }
  for (const key of Object.keys(property)) {
    if (!(key in (schema.properties ?? {}))) {
      problems.push(`property.example.json contains unknown field ${key}`)
    }
  }
}

for (const key of ['status', 'reference', 'image_digest']) {
  if (!(key in response)) problems.push(`storefront response omits ${key}`)
}

const env = block('dotenv', 'controller.example.env')
for (const key of [
  'APP_KEY',
  'DB_PASSWORD',
  'VENDRA_PROVISIONER_TOKEN',
  'CONSOLE_OPERATOR_USERNAME',
  'CONSOLE_OPERATOR_EMAIL',
  'CONSOLE_OPERATOR_PASSWORD'
]) {
  if (!new RegExp(`^${key}=.+$`, 'm').test(env)) {
    problems.push(`controller.example.env omits ${key}`)
  }
}

const yaml = block('yaml', 'controller.example.yaml')
for (const key of [
  'state_dir:',
  'base_domain:',
  'certificate_mode:',
  'acme_email:',
  'platform:',
  'website:',
  'storefront:',
  'provisioner:'
]) {
  if (!yaml.includes(key)) problems.push(`controller.example.yaml omits ${key}`)
}

if (problems.length) {
  console.error(`✗ ${problems.length} documentation example problem(s):`)
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

console.log(
  '✓ examples: controller, environment, property, and response shapes are valid'
)
