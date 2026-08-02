import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs'
import {
  Boundary,
  ChipRow,
  CommandList,
  DefList,
  FeatureGrid,
  Flow,
  Hero,
  Lede,
  NextSteps,
  Panel,
  StatRow,
  Steps,
  Tag
} from './components/vendra'

const themeComponents = getThemeComponents()

export function useMDXComponents(components) {
  return {
    ...themeComponents,
    Boundary,
    ChipRow,
    CommandList,
    DefList,
    FeatureGrid,
    Flow,
    Hero,
    Lede,
    NextSteps,
    Panel,
    StatRow,
    Steps,
    Tag,
    ...components
  }
}
