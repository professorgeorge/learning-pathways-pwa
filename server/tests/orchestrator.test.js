import { describe, it, expect } from 'vitest';
import { orchestrateActivity } from '../services/orchestrator.js';
import fs from 'fs';
import path from 'path';

const learningObjects = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../data/learning_objects.json'), 'utf-8')
);
const testObject = learningObjects[0]; // Normal distribution object

describe('Adaptation Orchestrator Policy Rules (§6.3)', () => {
  it('Policy 1: Novice with self_tests <= 2 leads with worked_example, followed by retrieval, and gates transfer', () => {
    const profile = {
      knowledge: { self_level: 'novice' },
      strategies: { self_tests: 1 },
      access: { reading_load: 'easy' },
      context: { device: 'laptop', typical_focus_minutes: 30 }
    };

    const result = orchestrateActivity(testObject, profile, {});
    const blockTypes = result.blocks.map(b => b.type);

    expect(result.meta.applied_policies).toContain('lead_worked_example_gate_transfer');
    
    // Explanation first, then worked_example, then retrieval
    expect(blockTypes[0]).toBe('explanation');
    expect(blockTypes[1]).toBe('worked_example');
    
    // Transfer item should be gated
    const transferBlock = result.blocks.find(b => b.type === 'transfer_item');
    expect(transferBlock).toBeDefined();
    expect(transferBlock.gated).toBe(true);
    expect(transferBlock.gated_reason).toMatch(/unlock/i);
  });

  it('Policy 2: reading_load == needs_audio_or_simplified selects plain explanation and keeps standard version in alternate blocks', () => {
    const profile = {
      access: { reading_load: 'needs_audio_or_simplified' },
      knowledge: { self_level: 'experienced' },
      strategies: { self_tests: 4 }
    };

    const result = orchestrateActivity(testObject, profile, {});
    const primaryExplanation = result.blocks.find(b => b.type === 'explanation');
    
    expect(primaryExplanation.reading_level).toBe('plain');
    expect(result.meta.applied_policies).toContain('plain_language_explanation');

    // Verify standard explanation is retained in alternate_blocks for UDL format tray
    const altStandard = result.alternate_blocks.find(b => b.type === 'explanation' && b.reading_level === 'standard');
    expect(altStandard).toBeDefined();
  });

  it('Policy 3: evidence.retrieval_accuracy_recent >= 0.8 elevates difficulty to challenge', () => {
    const profile = {
      knowledge: { self_level: 'some_background' },
      strategies: { self_tests: 3 }
    };
    const evidence = {
      retrieval_accuracy_recent: 0.9,
      hint_rate: 0.1
    };

    const result = orchestrateActivity(testObject, profile, evidence);
    expect(result.difficulty).toBe('challenge');
    expect(result.meta.applied_policies).toContain('increase_difficulty_challenge');
  });

  it('Policy 4: device == phone and typical_focus_minutes <= 20 sets chunking metadata', () => {
    const profile = {
      context: { device: 'phone', typical_focus_minutes: 15 },
      knowledge: { self_level: 'some_background' },
      strategies: { self_tests: 3 }
    };

    const result = orchestrateActivity(testObject, profile, {});
    expect(result.meta.chunking.is_chunked).toBe(true);
    expect(result.meta.chunking.max_blocks_per_step).toBe(2);
    expect(result.meta.applied_policies).toContain('phone_micro_chunking');
  });

  it('Policy 5: high hint_rate in evidence triggers worked_example before retrieval questions', () => {
    const profile = {
      knowledge: { self_level: 'experienced' },
      strategies: { self_tests: 4 }
    };
    const evidence = {
      retrieval_accuracy_recent: 0.5,
      hint_rate: 1.5 // High hint usage
    };

    const result = orchestrateActivity(testObject, profile, evidence);
    expect(result.meta.applied_policies).toContain('hint_rate_insert_worked_example');
    
    const workedExampleIdx = result.blocks.findIndex(b => b.type === 'worked_example');
    const firstRetrievalIdx = result.blocks.findIndex(b => b.type === 'retrieval_item');
    expect(workedExampleIdx).toBeGreaterThan(-1);
    expect(workedExampleIdx).toBeLessThan(firstRetrievalIdx);
  });
});
