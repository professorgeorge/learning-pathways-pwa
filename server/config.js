export const config = {
  port: process.env.PORT || 3000,
  aiEnabled: process.env.AI_ENABLED === 'true' || false,
  aiProvider: process.env.AI_PROVIDER || 'none',
  aiAllowedJobs: (process.env.AI_ALLOWED_JOBS || 'plain_summary,worked_example,alt_text,retrieval_items').split(','),
  aiRequireHumanReview: process.env.AI_REQUIRE_HUMAN_REVIEW !== 'false',
  aiMaxTokensPerDay: parseInt(process.env.AI_MAX_TOKENS_PER_DAY || '50000', 10),
  llmApiKey: process.env.LLM_API_KEY || '', // Never exposed to client
  jwtSecret: process.env.JWT_SECRET || 'dev-local-secret-udl-2026'
};
