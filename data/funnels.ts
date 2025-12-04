
import { DocType } from '../types';

export const FUNNELS = {
  founder_launch: {
    name: 'Founder Launch',
    description: 'A complete funnel from idea to investor-ready launch plan, covering strategy, product, and GTM.',
    stages: ['0. Strategic Analysis', '1. Strategy & Context', '2. Product Requirements', '8. Business & GTM'],
    docs: [
      DocType.GROWTH_PLAYBOOK, // Phase 0
      DocType.IDEA_VALIDATION, // Phase 0
      DocType.STRATEGY_VISION,
      DocType.STRATEGY_MARKET,
      DocType.STRATEGY_PERSONAS,
      DocType.STRATEGY_KPI,
      DocType.PRODUCT_BRD,
      DocType.PRODUCT_PRD,
      DocType.REQUIREMENTS_MATRIX, // Agent
      DocType.PRODUCT_STORIES,
      DocType.BIZ_PRICING,
      DocType.BIZ_GTM,
      DocType.INVESTOR_PACKAGE // Premium
    ],
  },
  feature_release: {
    name: 'Feature Release',
    description: 'A focused funnel for shipping a new feature, from product specs to QA and deployment.',
    stages: ['2. Product Requirements', '3. Architecture', '4. Code', '5. Quality'],
    docs: [
      DocType.PRODUCT_PRD,
      DocType.REQUIREMENTS_MATRIX,
      DocType.ARCH_DESIGN_MATRIX, // Agent
      DocType.CODE_IMPLEMENTATION, // Agent
      DocType.TEST_CASES,
      DocType.OPS_DEPLOY,
      DocType.USER_GUIDES,
    ],
  },
  tech_design: {
    name: 'Tech Architecture Design',
    description: 'A deep-dive funnel for engineering teams to define system architecture, components, and data models.',
    stages: ['3. Architecture & Design', '4. Implementation & Code', '9. Process & Governance'],
    docs: [
      DocType.ARCH_OVERVIEW,
      DocType.ARCH_DESIGN_MATRIX, // Agent
      DocType.ARCH_COMPONENTS,
      DocType.ARCH_DB,
      DocType.ARCH_API,
      DocType.CODE_SCAFFOLD,
      DocType.CODE_IMPLEMENTATION, // Agent
      DocType.PROCESS_ADR,
    ],
  },
  enterprise_readiness: {
    name: 'Enterprise Readiness',
    description: 'A funnel to prepare your product for enterprise customers, focusing on legal, sales, and admin docs.',
    stages: ['8. Business & GTM', '7. User & Customer Docs'],
    docs: [
      DocType.BIZ_SALES,
      DocType.BIZ_LEGAL,
      DocType.USER_ADMIN,
    ],
  },
  full_lifecycle: {
    name: 'Full Product Lifecycle',
    description: 'The complete suite of documents for an end-to-end product lifecycle management.',
    stages: ['All 9 Groups'],
    docs: Object.values(DocType) // Select all
  }
};
