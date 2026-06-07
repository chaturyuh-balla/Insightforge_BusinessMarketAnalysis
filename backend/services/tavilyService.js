export async function searchBusinessEvidence(query) {
  if (!process.env.TAVILY_API_KEY) {
    const error = new Error('TAVILY_API_KEY is missing. Add a valid Tavily API key to .env before generating reports.');
    error.status = 503;
    throw error;
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TAVILY_API_KEY}`
    },
    body: JSON.stringify({
      query: `${query} market research competitors pricing growth trends`,
      search_depth: 'advanced',
      include_answer: true,
      max_results: 8
    })
  });

  if (!response.ok) {
    throw new Error('Tavily research request failed.');
  }

  const data = await response.json();
  return (data.results || []).map((item, index) => ({
    id: index + 1,
    title: item.title || `Source ${index + 1}`,
    url: item.url,
    summary: item.content || item.raw_content || 'Relevant business research source.'
  }));
}
