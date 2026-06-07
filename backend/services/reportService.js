import { askGroqForReport } from './groqService.js';
import { searchBusinessEvidence } from './tavilyService.js';

export async function generateInsightReport(query) {
  const evidence = await searchBusinessEvidence(query);
  const report = await askGroqForReport(query, evidence);

  return {
    ...report,
    evidence,
    citations: evidence.map((source, index) => ({
      id: index + 1,
      label: `[${index + 1}]`,
      title: source.title,
      url: source.url
    })),
    generatedAt: new Date().toISOString()
  };
}
