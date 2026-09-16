import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('User-Facing Interface Audits: Zero Em Dashes', () => {
  it('strictly verifies zero em dashes exist in project source and public files', () => {
    const projectRoot = path.resolve(__dirname, '../..');
    const targetDirs = [
      path.join(projectRoot, 'src'),
      path.join(projectRoot, 'server', 'data'),
      path.join(projectRoot, 'public')
    ];

    const emDashRegex = /[\u2014]|&mdash;/;

    function checkDir(dir) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(full);
        } else if (/\.(js|html|json)$/.test(entry.name)) {
          const content = fs.readFileSync(full, 'utf-8');
          const hasEmDash = emDashRegex.test(content);
          if (hasEmDash) {
            console.error(`Em dash found in: ${full}`);
          }
          expect(hasEmDash).toBe(false);
        }
      }
    }

    targetDirs.forEach(checkDir);
  });
});
