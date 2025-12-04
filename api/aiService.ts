
import { GoogleGenAI } from "@google/genai";
import { AIGenerationRequest, DocType } from '../types';
import { DOC_HIERARCHY } from '../data/hierarchy';

// Configuration Helpers
const getAIConfig = () => {
  return {
    provider: localStorage.getItem('sf_provider') || 'google',
    openRouterKey: localStorage.getItem('sf_openrouter_key') || '',
    openRouterModel: localStorage.getItem('sf_openrouter_model') || 'anthropic/claude-3.5-sonnet'
  };
};

const getOpenRouterModelForDoc = (docType: string) => {
  const globalModel = localStorage.getItem('sf_openrouter_model') || 'anthropic/claude-3.5-sonnet';
  try {
    const overrides = JSON.parse(localStorage.getItem('sf_model_overrides') || '{}');
    if (overrides[docType]) {
      return overrides[docType];
    }
  } catch (e) {
    console.warn('Failed to parse model overrides', e);
  }
  return globalModel;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry Helper with Exponential Backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, baseDelay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error.message?.includes('429') || error.status === 429 || error.status === 'RESOURCE_EXHAUSTED';
    if (retries === 0 || !isRateLimit) {
      throw error;
    }
    console.warn(`Rate limit hit. Retrying in ${baseDelay}ms... (${retries} retries left)`);
    await delay(baseDelay);
    return retryWithBackoff(fn, retries - 1, baseDelay * 2);
  }
}

// Helper for Google GenAI calls
async function callGoogleGenAI(prompt: string, docType: string) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.warn("No API Key found in process.env.API_KEY. Using Mock Mode.");
    await delay(2000); 
    return {
      success: true,
      content: `## Mock Generated ${docType.toUpperCase()}\n\nThis is a simulated response.\n\n## 1. Content\nMock content for ${docType}.`,
      model: 'mock-model'
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  // Intelligent config based on doc type
  const useSearch = [
    DocType.STRATEGY_MARKET, DocType.STRATEGY_VISION, DocType.BIZ_GTM, 
    DocType.COMPETITOR_ANALYSIS, DocType.ARCH_OVERVIEW, DocType.IDEA_VALIDATION
  ].includes(docType as DocType);

  const useThinking = [
    DocType.ARCH_DB, DocType.ARCH_API, DocType.TEST_CASES, 
    DocType.PRODUCT_STORIES, DocType.CODE_SCAFFOLD, DocType.GROWTH_PLAYBOOK,
    DocType.REQUIREMENTS_MATRIX, DocType.ARCH_DESIGN_MATRIX, DocType.CODE_IMPLEMENTATION
  ].includes(docType as DocType);

  try {
    const config: any = {
      systemInstruction: "You are an expert technical writer, product manager, and systems architect. Generate professional, detailed, and actionable documentation. Return ONLY the markdown content. Use Markdown H2 (##) for all main sections.",
    };

    if (useSearch) config.tools = [{ googleSearch: {} }];

    let modelName = 'gemini-2.5-flash';
    if (useThinking) {
      modelName = 'gemini-3-pro-preview';
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    const response = await retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: config
      });
    });

    let content = response.text || "";

    // Append sources if available
    if (useSearch && response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      const chunks = response.candidates[0].groundingMetadata.groundingChunks;
      const sources = chunks
        .map((chunk: any) => chunk.web?.uri)
        .filter((uri: string | undefined | null) => uri)
        .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index);

      if (sources.length > 0) {
        content += "\n\n## References & Sources\n\n" + sources.map((s: string) => `- [${s}](${s})`).join('\n');
      }
    }

    return { success: true, content: content, model: modelName };
  } catch (error: any) {
    console.error(`Error generating ${docType} via Gemini:`, error);
    if (error.message?.includes('429') || error.status === 429 || error.status === 'RESOURCE_EXHAUSTED') {
       const openRouterKey = localStorage.getItem('sf_openrouter_key');
       if (openRouterKey) {
          console.log(`Failing over to OpenRouter for ${docType} due to Google Rate Limit`);
          const fallbackModel = getOpenRouterModelForDoc(docType);
          return callOpenRouter(prompt, docType, {
            openRouterKey,
            openRouterModel: fallbackModel
          });
       }
       return {
         success: true,
         content: `## ⚠️ Rate Limit\n\nAI provider busy. Please try again later or configure OpenRouter backup.\n\n## Placeholder for ${docType}\n- Section 1\n- Section 2`,
         model: 'fallback-mode'
       };
    }
    return { success: false, error: error.message, docType };
  }
}

async function callOpenRouter(prompt: string, docType: string, config: any) {
  if (!config.openRouterKey) return { success: false, error: "Missing OpenRouter Key", docType };
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.openRouterKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Systematic Funnels",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: config.openRouterModel,
        messages: [
          { role: "system", content: "You are an expert technical writer. Generate professional markdown documentation." },
          { role: "user", content: prompt }
        ]
      })
    });
    if (!response.ok) throw new Error((await response.json()).error?.message);
    const data = await response.json();
    return { success: true, content: data.choices?.[0]?.message?.content || "", model: data.model };
  } catch (error: any) {
    return { success: false, error: error.message, docType };
  }
}

// === SPECIFIC PROMPT BUILDERS ===

function buildGrowthPlaybookPrompt(req: AIGenerationRequest): string {
  return `
    Role: Senior Product Strategist.
    Task: Conduct a deep "Phase 1-5" Strategic Analysis using the Big Product Growth Playbook.
    
    Context:
    Idea: ${req.projectConcept}
    Problem: ${req.problem}
    Audience: ${req.targetAudience}

    INSTRUCTIONS:
    Analyze the project through these 5 specific phases:
    
    ## Phase 1: Problem & Market Validation
    - Is this a painkiller or a vitamin?
    - Estimate TAM (Total Addressable Market).
    - Identify 3 competitor weaknesses.
    - Define the USP (Unique Selling Proposition).

    ## Phase 2: Wedge & MVP Launch
    - Pick one tiny but urgent use case (The Wedge).
    - List the absolute minimum features (MVP).
    - Recommend a fast tech stack.

    ## Phase 3: Distribution
    - Choose 3 main acquisition channels.
    - Define a viral loop.

    ## Phase 4: Retention & Expansion
    - Define the "Aha!" moment.
    - Suggest an upsell strategy.

    ## Phase 5: Scaling to a Brand
    - Brand story angle.
    - Community building strategy.

    Output format: Markdown with strict H2 headers for phases.
  `;
}

function buildRequirementsMatrixPrompt(req: AIGenerationRequest): string {
  return `
    Role: System Architect.
    Task: Create a structured Requirements Matrix.
    
    PREVIOUS STRATEGIC CONTEXT:
    ${req.strategicContext || "N/A"}
    
    Context:
    Project: ${req.projectConcept}
    Features: ${req.features.join(', ')}

    INSTRUCTIONS:
    1. Refine the features into clear, testable User Stories (Given/When/Then).
    2. Identify specific technical risks or ambiguities for each.
    3. Suggest the best-fit library or tech for that specific requirement.
    
    Output Format:
    Create a Markdown Table with these columns:
    | Requirement | User Story | Risk | Suggested Tech |
  `;
}

function buildArchDesignPrompt(req: AIGenerationRequest): string {
  return `
    Role: Lead Cloud Solutions Architect & DevOps SME.
    Task: Create a comprehensive System Design Document.
    
    PREVIOUS STRATEGIC CONTEXT:
    ${req.strategicContext || "N/A"}

    Context:
    Project: ${req.projectConcept}
    Tech Stack: ${req.preferences.tech.join(', ')}

    INSTRUCTIONS:
    Generate a detailed, production-ready System Design Document in Markdown format. Adhere to the 12-Factor App methodology where applicable.

    The document must include these specific sections using H2 (##) headers:

    ## 1. Executive Summary
    - A high-level overview of the proposed architecture.
    - Key technology choices and design principles.

    ## 2. Architectural Principles & Patterns
    - Chosen pattern (e.g., Monolith, Microservices, Serverless).
    - Justification for the choice based on project context.
    - Adherence to 12-Factor App principles.

    ## 3. System Components Diagram
    - Describe the high-level components and their interactions.
    - **Provide a Mermaid.js 'graph TD' diagram inside a 'mermaid' code block.**
      (e.g., \`\`\`mermaid\ngraph TD;\n  A[Client] --> B(API Gateway);\n\`\`\`)

    ## 4. Data Model & Persistence
    - Proposed database schema (SQL or NoSQL).
    - Rationale for database choice (e.g., Postgres, MongoDB).
    - Data scaling strategy (e.g., sharding, read replicas).

    ## 5. API Design & Contracts
    - RESTful or GraphQL API design.
    - Example request/response for a key endpoint.
    - Authentication strategy (e.g., JWT, OAuth2).

    ## 6. Scalability & Performance
    - Caching strategy (e.g., Redis for session, CDN for assets).
    - Load balancing approach.
    - Asynchronous processing (e.g., message queues like RabbitMQ/SQS).

    ## 7. Security & Compliance
    - Key security considerations (OWASP Top 10).
    - Data encryption (at-rest and in-transit).
    - Authentication and authorization mechanisms.

    ## 8. Observability
    - Logging strategy (what to log, structured logging).
    - Metrics to monitor (e.g., latency, error rate).
    - Tracing approach.

    ## 9. Deployment & CI/CD
    - Proposed CI/CD pipeline (e.g., GitHub Actions workflow).
    - Deployment environment strategy (Dev, Staging, Prod).
    - Rollback plan.
  `;
}

function buildCodeImplementationPrompt(req: AIGenerationRequest): string {
  return `
    Role: Senior Coding Assistant.
    Task: Write production-ready code for the core feature.
    
    PREVIOUS STRATEGIC CONTEXT:
    ${req.strategicContext || "N/A"}

    Context:
    Project: ${req.projectConcept}
    Tech: ${req.preferences.tech.join(', ')}
    Feature: ${req.features[0] || 'Core Functionality'}

    INSTRUCTIONS:
    1. Be concise (only show necessary code).
    2. Follow best practices (clean code, types).
    3. Include minimal inline comments.
    4. Output only the final code block(s).
    
    Output Format: Markdown Code Blocks.
  `;
}

function buildInvestorPackagePrompt(req: AIGenerationRequest): string {
  return `
    Role: Venture Capital Consultant.
    Task: Generate a Premium Investor Export Package.
    
    PREVIOUS STRATEGIC CONTEXT:
    ${req.strategicContext || "N/A"}

    Context:
    Project: ${req.projectConcept}
    
    INSTRUCTIONS:
    Generate three distinct sections:

    ## 1. Executive Summary
    - 1-page synthesis of Vision, Market, Problem, and Solution.
    - High-level financial ask.

    ## 2. Pitch Book Structure
    - Slide-by-slide outline (Problem, Solution, Market, Traction, Team, Ask).
    - Key talking points for each slide.

    ## 3. Financial Model Template
    - Basic Unit Economics (CAC, LTV).
    - 12-month projected revenue table (markdown table).
    - Key assumptions listing.
  `;
}

// === GENERIC PROMPT BUILDER FOR UNIVERSAL TREE ===
function buildGenericPrompt(docType: DocType, req: AIGenerationRequest): string {
  // Route to specialized builders first
  if (docType === DocType.GROWTH_PLAYBOOK) return buildGrowthPlaybookPrompt(req);
  if (docType === DocType.REQUIREMENTS_MATRIX) return buildRequirementsMatrixPrompt(req);
  if (docType === DocType.ARCH_DESIGN_MATRIX) return buildArchDesignPrompt(req);
  if (docType === DocType.CODE_IMPLEMENTATION) return buildCodeImplementationPrompt(req);
  if (docType === DocType.INVESTOR_PACKAGE) return buildInvestorPackagePrompt(req);
  
  // Base instructions for code scaffold
  if (docType === DocType.AUTH_SYSTEM) {
    return `
      Generate a complete backend Authentication & User Management system design and code scaffold.
      Include sections for:
      1.  **API Endpoints:** (POST /auth/signup, POST /auth/login, POST /auth/refresh, GET /users/me).
      2.  **JWT Strategy:** (Access Token, Refresh Token, httpOnly cookies).
      3.  **Password Hashing:** (bcrypt/argon2).
      4.  **Middleware:** (JWT verification, Role-Based Access Control - RBAC).
      5.  **Database Schema:** (users, roles, permissions tables).
      6.  **Code Scaffold:** (Provide Node.js/Express code snippets for controllers and services).
      7.  **Security Best Practices:** (OWASP Top 10 considerations).
    `;
  } 
  
  if (docType === DocType.BILLING_SYSTEM) {
    return `
      Generate a complete Stripe Billing System integration plan and code scaffold.
      Include sections for:
      1.  **Subscription Plans:** (Define Starter, Pro, Agency tiers in Stripe Products).
      2.  **Checkout Flow:** (Client-side logic and server-side endpoint for creating Stripe Checkout Sessions).
      3.  **Stripe Webhook Handler:** (Code to handle 'checkout.session.completed', 'invoice.paid', 'customer.subscription.deleted').
      4.  **Customer Portal:** (Endpoint to create a portal session for users to manage their subscription).
      5.  **Database Schema Updates:** (Add stripe_customer_id, subscription_status to the users table).
      6.  **Code Scaffold:** (Provide Node.js/Express code snippets for all backend logic).
    `;
  }
  
  if (docType === DocType.IDEA_VALIDATION) {
     return `
        Role: Product Validator.
        Task: 9-Stage Product Idea Validation.
        Stages: Idea Capture, Problem Validation, USP, MVP Definition, Tech Feasibility, User Flow, Market Insight, Prioritization, Documentation.
        Analyze the idea "${req.projectConcept}" through these 9 stages.
     `;
  }

  if (docType === DocType.CROSS_QUESTIONING) {
     return `
        Role: Devil's Advocate / AI Auditor.
        Task: Apply the Universal Cross-Questioning Funnel.
        
        PREVIOUS STRATEGIC CONTEXT:
        ${req.strategicContext || "N/A"}

        Stages: Core Idea, User Journey, UI/UX, Features, Tech Arch, Roadmap, Continuous Validation.
        Challenge every assumption about "${req.projectConcept}". Ask 5 critical questions per stage.
     `;
  }

  const node = DOC_HIERARCHY[docType];
  const title = node ? node.title : docType.replace(/_/g, ' ').toUpperCase();
  const desc = node ? node.description : "";
  const category = node ? node.category : "";

  let specializedContext = "";
  if (req.projectConcept.toLowerCase().includes("funnel") || req.projectConcept.toLowerCase().includes("marketplace")) {
    specializedContext = `
      SPECIALIZED CONTEXT:
      This is a High-Conversion Funnel / Platform project.
      Focus heavily on:
      1. Conversion Rate Optimization (CRO)
      2. User Retention Mechanics (Hooks)
      3. Revenue Maximization (Upsells, Cross-sells)
      4. Trust Signals and Social Proof
    `;
  }

  const context = `
PROJECT CONTEXT:
Name: [Derived from Concept]
Concept: ${req.projectConcept}
Problem: ${req.problem}
Audience: ${req.targetAudience}
Features: ${req.features.join(', ')}
Tech Stack: ${req.preferences.tech.join(', ')}
Timeline: ${req.preferences.timeline}
Budget: ${req.preferences.budget}

STRATEGIC ANALYSIS (USE THIS AS GROUND TRUTH):
${req.strategicContext || "No previous analysis. Perform standard generation."}

${specializedContext}
`;

  let instructions = "";

  if (category.includes("Strategy")) {
    instructions = `
      Focus on high-level strategic alignment.
      Analyze the market fit, user needs, and long-term vision.
      Include sections: Vision, Mission, Strategic Pillars, Market Analysis.
    `;
  } else if (category.includes("Product")) {
    instructions = `
      Focus on detailed functional requirements.
      Define User Stories, Acceptance Criteria, and MoSCoW priorities.
      Include sections: Features, User Flows, Data Requirements.
    `;
  } else if (category.includes("Architecture") || category.includes("Code")) {
    instructions = `
      Focus on technical implementation details.
      Provide specific technology choices, patterns, and component breakdowns.
      Include sections: System Design, Data Model, API Contracts, Security.
    `;
  } else if (category.includes("Business")) {
    instructions = `
      Focus on commercial viability and growth.
      Analyze costs, revenue models, and go-to-market channels.
      Include sections: Pricing Strategy, Sales Channels, Unit Economics (CAC/LTV).
    `;
  } else {
    instructions = `
      Focus on ${desc}.
      Provide actionable guides, checklists, and clear process definitions.
    `;
  }

  return `
    Create the document: "${title}"
    Description: ${desc}
    
    ${context}

    INSTRUCTIONS:
    ${instructions}

    FORMAT:
    - Use Markdown H2 (##) for all main sections.
    - Be professional, concise, and actionable.
    - If relevant, include tables or code blocks.
  `;
}

// === NEW: BRAINSTORMING / AUTO-FILL ===
export async function generateProjectSpecs(idea: string) {
  const prompt = `
    Role: Startup Consultant & Product Strategist.
    Task: Analyze this rough product idea and generate professional specifications.
    
    Rough Idea: "${idea}"
    
    Output structured JSON ONLY with these keys:
    {
      "name": "Catchy Product Name",
      "concept": "Refined 1-sentence concept",
      "problem": "Clear problem statement (pain point)",
      "audience": "Specific target audience definition",
      "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
      "techStack": ["Recommended Tech 1", "Recommended Tech 2"]
    }
  `;
  
  const result = await callGoogleGenAI(prompt, DocType.STRATEGY_VISION); // Reuse existing caller
  if (!result.success || !result.content) return null;

  try {
    // Strip markdown code blocks if present
    const cleanJson = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse AI specs", e);
    return null;
  }
}

// === REFINEMENT ===
export async function refineDocument(currentContent: string, instruction: string, docType: DocType) {
  const config = getAIConfig();
  const prompt = `
    Role: Expert Editor.
    Task: Update the content below based on the instruction.
    Instruction: "${instruction}"
    
    Content:
    """${currentContent}"""
    
    Output: Updated Markdown only. No preamble.
  `;

  if (config.provider === 'openrouter' && config.openRouterKey) {
     const model = getOpenRouterModelForDoc(docType);
     return callOpenRouter(prompt, docType, { ...config, openRouterModel: model });
  }
  return callGoogleGenAI(prompt, docType);
}

// === CENTRALIZED GENERATOR ===
export async function generateDocument(docType: DocType, req: AIGenerationRequest) {
  // Use Generic Builder for all types in the hierarchy
  const prompt = buildGenericPrompt(docType, req);
  return callAI(prompt, docType);
}

// === STREAMING SIMULATION ===
export async function streamDocumentGeneration(
  docType: DocType,
  req: AIGenerationRequest,
  onProgress: (progress: number, phase: string) => void
): Promise<{ success: boolean; content?: string; error?: string }> {
  
  onProgress(5, 'Initializing...');
  await delay(500);
  
  onProgress(15, 'Analyzing context...');
  
  const generationPromise = generateDocument(docType, req);

  let currentProgress = 20;
  // Use a timeout reference to clear interval if promise resolves fast
  const interval = setInterval(() => {
    if (currentProgress < 90) {
      currentProgress += Math.floor(Math.random() * 8) + 2;
      const phases = ['Drafting sections...', 'expanding details...', 'checking constraints...'];
      onProgress(Math.min(90, currentProgress), phases[Math.floor(Math.random() * phases.length)]);
    }
  }, 800);

  try {
    const result = await generationPromise;
    clearInterval(interval);
    
    if (result.success) {
      onProgress(100, 'Completed');
    } else {
      onProgress(100, 'Failed');
    }
    
    return result;
  } catch (error: any) {
    clearInterval(interval);
    onProgress(0, 'Failed');
    return { success: false, error: error.message };
  }
}

async function callAI(prompt: string, docType: string) {
  const config = getAIConfig();
  if (config.provider === 'openrouter' && config.openRouterKey) {
    const model = getOpenRouterModelForDoc(docType);
    return callOpenRouter(prompt, docType, { ...config, openRouterModel: model });
  }
  return callGoogleGenAI(prompt, docType);
}

// Helper to get doc metadata for UI
export function getDocMetadata(docType: DocType) {
  return DOC_HIERARCHY[docType] || {
    id: docType,
    title: docType.replace(/_/g, ' '),
    category: "Other",
    owner: "AI",
    cta: "Next",
    description: ""
  };
}

export async function validateOpenRouterConfig(apiKey: string, model: string = 'anthropic/claude-3.5-sonnet') {
  if (!apiKey) return { success: false, error: "API Key is required" };
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: "Test" }],
        max_tokens: 5
      })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const data = await response.json();
      return { success: false, error: data.error?.message || "Invalid configuration" };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}