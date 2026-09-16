import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { runAiJob } from '../services/ai_adapter.js';

describe('Security and Boundary Isolation Tests (§4, §7.4)', () => {
  it('AI adapter returns unavailable when AI_ENABLED is false', async () => {
    const res = await runAiJob({
      job_type: 'plain_summary',
      learning_object_id: 'test_obj',
      constraints: {},
      learner_slice: { self_level: 'novice' }
    });

    expect(res.status).toBe('unavailable');
    expect(res.policy_flags).toContain('FLAG_AI_DISABLED');
    expect(res.proposed_blocks).toHaveLength(0);
  });

  it('verifies client directories do not contain vendor LLM SDKs or secrets', () => {
    const projectRoot = path.resolve(__dirname, '../..');
    const clientDirs = [
      path.join(projectRoot, 'public'),
      path.join(projectRoot, 'src')
    ];

    const forbiddenPatterns = [
      /sk-[a-zA-Z0-9]{20,}/i,
      /api[_-]?key\s*=\s*['"][a-zA-Z0-9_-]{20,}['"]/i,
      /openai\/v1/i,
      /anthropic\.com\/v1/i
    ];

    function scanDir(dir) {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          scanDir(fullPath);
        } else if (/\.(js|html|css|json)$/.test(file.name)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          for (const pattern of forbiddenPatterns) {
            expect(pattern.test(content)).toBe(false);
          }
        }
      }
    }

    clientDirs.forEach(scanDir);
  });
});
