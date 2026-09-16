/**
 * Client-Side Deterministic Adaptation Orchestrator
 * Pure functions: Runs 100% in-browser for static hosting like GitHub Pages.
 */

export function validateUdlEnvelope(blocks) {
  const hasExplanation = blocks.some(b => b.type === 'explanation');
  const hasComplementary = blocks.some(b => ['diagram', 'worked_example', 'audio', 'video'].includes(b.type));
  const retrievalCount = blocks.filter(b => b.type === 'retrieval_item' && !b.transfer).length;
  const hasTransfer = blocks.some(b => b.type === 'transfer_item' || (b.type === 'retrieval_item' && b.transfer));

  return {
    valid: hasExplanation && hasComplementary && retrievalCount >= 2 && hasTransfer,
    details: { hasExplanation, hasComplementary, retrievalCount, hasTransfer }
  };
}

export function orchestrateActivity(learningObject, profile = {}, evidence = {}) {
  const access = profile.access || {};
  const context = profile.context || {};
  const knowledge = profile.knowledge || {};
  const strategies = profile.strategies || {};

  const rawBlocks = JSON.parse(JSON.stringify(learningObject.blocks || []));

  // 1. Select appropriate primary explanation based on reading load
  const isSimplifiedNeeded = access.reading_load === 'needs_summary' || access.reading_load === 'needs_audio_or_simplified';
  let primaryExplanation = rawBlocks.find(b => b.type === 'explanation' && (isSimplifiedNeeded ? b.reading_level === 'plain' : b.reading_level === 'standard'));
  if (!primaryExplanation) {
    primaryExplanation = rawBlocks.find(b => b.type === 'explanation');
  }

  // 2. Identify core blocks
  const diagrams = rawBlocks.filter(b => b.type === 'diagram');
  const workedExamples = rawBlocks.filter(b => b.type === 'worked_example');
  const audioBlocks = rawBlocks.filter(b => b.type === 'audio');
  const videoBlocks = rawBlocks.filter(b => b.type === 'video');
  const retrievalItems = rawBlocks.filter(b => b.type === 'retrieval_item' && !b.transfer);
  const transferItems = rawBlocks.filter(b => b.type === 'transfer_item' || (b.type === 'retrieval_item' && b.transfer));

  // 3. Strategy & Scaffolding decisions
  const isNovice = knowledge.self_level === 'novice';
  const isLowSelfTest = (strategies.self_tests || 3) <= 2;
  const isHighAccuracy = (evidence.retrieval_accuracy_recent || 0) >= 0.8;
  const isHighHintRate = (evidence.hint_rate || 0) >= 1.0;
  const isPhoneFocusLimited = context.device === 'phone' && (context.typical_focus_minutes || 30) <= 20;

  // Add metacognitive scaffolding prompts if self_tests is low
  const scaffoldedRetrieval = retrievalItems.slice(0, 2).map((item, idx) => {
    if (isLowSelfTest && idx === 0) {
      return {
        ...item,
        scaffold_prompt: 'Try answering without looking back at the notes first to build strong retrieval memory.'
      };
    }
    return item;
  });

  // 4. Primary sequence construction
  let primarySequence = [];

  if (isNovice && isLowSelfTest && workedExamples.length > 0) {
    if (primaryExplanation) primarySequence.push(primaryExplanation);
    primarySequence.push(...workedExamples);
    primarySequence.push(...scaffoldedRetrieval);
  } else if (isHighHintRate && workedExamples.length > 0) {
    if (primaryExplanation) primarySequence.push(primaryExplanation);
    primarySequence.push(...workedExamples);
    primarySequence.push(...scaffoldedRetrieval);
  } else {
    if (primaryExplanation) primarySequence.push(primaryExplanation);

    const firstPref = access.first_format_preference;
    if (firstPref === 'watch' && videoBlocks.length > 0) {
      primarySequence.push(videoBlocks[0]);
    } else if (firstPref === 'listen' && audioBlocks.length > 0) {
      primarySequence.push(audioBlocks[0]);
    } else if (diagrams.length > 0) {
      primarySequence.push(diagrams[0]);
    } else if (workedExamples.length > 0) {
      primarySequence.push(workedExamples[0]);
    }

    scaffoldedRetrieval.forEach(ret => {
      if (!primarySequence.some(b => b.id === ret.id)) {
        primarySequence.push(ret);
      }
    });
  }

  // Complementary representation guarantee
  const hasComp = primarySequence.some(b => ['diagram', 'worked_example', 'audio', 'video'].includes(b.type));
  if (!hasComp && diagrams.length > 0) primarySequence.splice(1, 0, diagrams[0]);

  // Retrieval count guarantee
  const currentRetrievalCount = primarySequence.filter(b => b.type === 'retrieval_item' && !b.transfer).length;
  if (currentRetrievalCount < 2) {
    scaffoldedRetrieval.forEach(item => {
      if (!primarySequence.some(b => b.id === item.id)) primarySequence.push(item);
    });
  }

  // Transfer item
  const primaryTransfer = transferItems[0] || {
    id: 'blk_tra_default',
    type: 'transfer_item',
    stem: 'Apply your understanding to a new real-world scenario.',
    options: ['Option A', 'Option B'],
    correct_index: 0,
    transfer: true
  };

  const gatedTransfer = {
    ...primaryTransfer,
    gated: isNovice && isLowSelfTest,
    gated_reason: isNovice && isLowSelfTest ? 'Complete the two retrieval questions above to unlock this challenge.' : null
  };
  primarySequence.push(gatedTransfer);

  const chunkingMeta = {
    is_chunked: isPhoneFocusLimited,
    max_blocks_per_step: isPhoneFocusLimited ? 2 : 5,
    recommended_focus_minutes: context.typical_focus_minutes || 20
  };

  const servedIds = new Set(primarySequence.map(b => b.id));
  const alternateBlocks = rawBlocks.filter(b => !servedIds.has(b.id));

  const audioInPrimary = primarySequence.some(b => b.type === 'audio');
  const needsAudioNotice = access.reading_load === 'needs_audio_or_simplified' && !audioInPrimary;

  const envelopeCheck = validateUdlEnvelope(primarySequence);

  return {
    object_id: learningObject.object_id,
    topic_id: learningObject.topic_id,
    learning_objective: learningObject.learning_objective,
    difficulty: isHighAccuracy ? 'challenge' : learningObject.difficulty,
    served_block_order: primarySequence.map(b => b.id),
    blocks: primarySequence,
    alternate_blocks: alternateBlocks,
    udl_envelope_valid: envelopeCheck.valid,
    meta: {
      chunking: chunkingMeta,
      extra_time: !!access.extra_time,
      larger_text: !!access.larger_text,
      captions_needed: !!access.captions_needed,
      audio_accessible: audioBlocks.length > 0 || !!access.reading_load,
      needs_audio_notice: needsAudioNotice,
      applied_policies: [
        ...(isNovice && isLowSelfTest ? ['lead_worked_example_gate_transfer'] : []),
        ...(isSimplifiedNeeded ? ['plain_language_explanation'] : []),
        ...(isHighAccuracy ? ['increase_difficulty_challenge'] : []),
        ...(isHighHintRate ? ['hint_rate_insert_worked_example'] : []),
        ...(isPhoneFocusLimited ? ['phone_micro_chunking'] : [])
      ]
    }
  };
}
