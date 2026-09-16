import { describe, it, expect } from 'vitest';
import { orchestrateActivity, validateUdlEnvelope } from '../services/orchestrator.js';
import fs from 'fs';
import path from 'path';

const learningObjects = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../data/learning_objects.json'), 'utf-8')
);

describe('UDL Envelope Contract Tests (§6.1)', () => {
  it('every learning object produces a compliant UDL envelope across diverse profiles', () => {
    const sampleProfiles = [
      {
        access: { reading_load: 'easy', first_format_preference: 'watch' },
        context: { device: 'laptop' },
        knowledge: { self_level: 'experienced' },
        strategies: { self_tests: 4 }
      },
      {
        access: { reading_load: 'needs_summary', first_format_preference: 'read' },
        context: { device: 'phone', typical_focus_minutes: 15 },
        knowledge: { self_level: 'novice' },
        strategies: { self_tests: 1 }
      },
      {
        access: { reading_load: 'needs_audio_or_simplified', first_format_preference: 'listen' },
        context: { device: 'both' },
        knowledge: { self_level: 'some_background' },
        strategies: { self_tests: 2 }
      }
    ];

    for (const lo of learningObjects) {
      for (const profile of sampleProfiles) {
        const payload = orchestrateActivity(lo, profile);

        // Direct validator check
        const check = validateUdlEnvelope(payload.blocks);
        expect(check.valid).toBe(true);

        // 1. One explanation
        const explanations = payload.blocks.filter(b => b.type === 'explanation');
        expect(explanations.length).toBeGreaterThanOrEqual(1);

        // 2. One complementary representation (diagram, worked_example, audio, video)
        const complementaries = payload.blocks.filter(b => ['diagram', 'worked_example', 'audio', 'video'].includes(b.type));
        expect(complementaries.length).toBeGreaterThanOrEqual(1);

        // 3. Two retrieval questions
        const retrievals = payload.blocks.filter(b => b.type === 'retrieval_item' && !b.transfer);
        expect(retrievals.length).toBeGreaterThanOrEqual(2);

        // 4. One transfer item
        const transfers = payload.blocks.filter(b => b.type === 'transfer_item' || b.transfer);
        expect(transfers.length).toBeGreaterThanOrEqual(1);

        // Never a single-modality lesson
        const uniqueTypes = new Set(payload.blocks.map(b => b.type));
        expect(uniqueTypes.size).toBeGreaterThanOrEqual(3);

        // Alternate representations must be populated for UDL Format Tray
        expect(Array.isArray(payload.alternate_blocks)).toBe(true);
      }
    }
  });
});
