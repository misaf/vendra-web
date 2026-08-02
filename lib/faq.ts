/**
 * The FAQ: questions actually asked by clients, operators, and developers,
 * answered in full — including the ones where the answer was no.
 *
 * Same machinery as the blog, bound to a different root. An entry is a question
 * page under `app/faq/<slug>/page.mdx` whose `date` is the day it was answered,
 * so the newest answer sorts first.
 */
import type { Entry } from './collection'
import { getEntries, getEntriesByTag, getEntryTags } from './collection'

export const faqRoot = '/faq' as const

export function getQuestions(): Promise<Entry[]> {
  return getEntries(faqRoot)
}

export function getQuestionTags(): Promise<{ tag: string; count: number }[]> {
  return getEntryTags(faqRoot)
}

export function getQuestionsByTag(slug: string): Promise<Entry[]> {
  return getEntriesByTag(faqRoot, slug)
}
