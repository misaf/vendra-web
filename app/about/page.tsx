import type { Metadata } from 'next'
import { Section, TeamGrid } from '../../components/marketing'
import { team } from '../../lib/team'
import { MarketingPage } from '../../components/page-wrapper'

export const metadata: Metadata = {
  title: 'About',
  description:
    'The small team building and supporting the Vendra commerce ecosystem.'
}

export default function AboutPage() {
  return (
    <MarketingPage>
      <Section
        titleAs="h1"
        eyebrow="About"
        title="Built by the people who answer for it"
        lede="The same names appear on the commits, in the technical writing, and in the conversations around a deployment."
        align="center"
      >
        <TeamGrid members={team} />
      </Section>

      <Section
        align="center"
        size="lg"
        title="Built in the open"
        lede="Architecture decisions, implementation details, and the reasoning behind them are published alongside the code."
        tone="accent"
        actions={[
          {
            href: 'https://github.com/misaf',
            label: 'View the work on GitHub',
            primary: true,
            external: true
          },
          { href: '/blog', label: 'Read the blog' }
        ]}
      />
    </MarketingPage>
  )
}
