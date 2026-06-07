const defaultModelName = 'llama-3.1-8b-instant';

export async function askGroqForReport(query, evidence) {
  if (!process.env.GROQ_API_KEY) {
    const error = new Error('GROQ_API_KEY is missing. Add a valid Groq API key to .env before generating reports.');
    error.status = 503;
    throw error;
  }

  const modelName = process.env.GROQ_MODEL || defaultModelName;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: modelName,
      temperature: 0.25,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are InsightForge AI, a multi-agent business research and strategy platform. Return strict JSON only.'
        },
        {
          role: 'user',
          content: buildPrompt(query, evidence)
        }
      ]
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error?.message || `Groq request failed with status ${response.status}.`);
    error.status = response.status;
    throw error;
  }

  return parseJson(data.choices?.[0]?.message?.content || '');
}

function buildPrompt(query, evidence) {
  return `
Analyze this company or startup idea: "${query}".

Use these Tavily evidence sources:
${JSON.stringify(evidence, null, 2)}

Return strict JSON only. No markdown.
Schema:
{
  "executiveSummary": "string",
  "marketResearch": {
    "industryOverview": "string",
    "marketSizeClassification": "Local|Intermediate|Global",
    "growthTrends": ["string"],
    "customerSegments": ["string"],
    "painPoints": ["string"],
    "risksChallenges": ["string"],
    "emergingTechnologies": ["string"]
  },
  "strategicAnalysis": {
    "swot": { "strengths": ["string"], "weaknesses": ["string"], "opportunities": ["string"], "threats": ["string"] },
    "competitors": { "direct": ["string"], "indirect": ["string"], "advantages": ["string"], "marketGaps": ["string"] },
    "pricing": { "model": "string", "subscription": ["string"], "freemium": ["string"], "revenueStrategies": ["string"] },
    "goToMarket": { "targetAudience": ["string"], "channels": ["string"], "launchPlan": ["string"], "growthStrategy": ["string"] }
  },
  "critic": {
    "weakAssumptions": ["string"],
    "unsupportedClaims": ["string"],
    "suggestedImprovements": ["string"]
  },
  "dashboard": {
    "swotDistribution": [{"name":"Strengths","value": number},{"name":"Weaknesses","value": number},{"name":"Opportunities","value": number},{"name":"Threats","value": number}],
    "competitorComparison": [{"name":"Feature Coverage","value": number},{"name":"Market Presence","value": number},{"name":"Differentiation","value": number}],
    "readiness": [{"metric":"Market Potential","score": number},{"metric":"Competition","score": number},{"metric":"Growth Potential","score": number},{"metric":"Risk Level","score": number},{"metric":"Scalability","score": number}]
  }
}`;
}

function parseJson(text) {
  if (!text.trim()) {
    throw new Error('Groq returned an empty response.');
  }
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}
