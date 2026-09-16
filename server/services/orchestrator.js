/**
 * Deterministic Adaptation Orchestrator
 * Pure functions: Same inputs -> Same lesson plan.
 * Always adheres to Universal Design for Learning (UDL) principles.
 */

/**
 * Validates whether an activity payload satisfies the mandatory UDL envelope:
 * 1. At least one explanation
 * 2. At least one complementary representation (diagram, worked_example, audio, video)
 * 3. At least two retrieval questions
 * 4. At least one transfer item
 */
export function validateUdlEnvelope(blocks) {
  const hasExplanation = blocks.some(b => b.type === 'explanation');
  const hasComplementary = blocks.some(b => ['diagram', 'worked_example', 'audio', 'video'].includes(b.type));
  const retrievalCount = blocks.filter(b => b.type === 'retrieval_item' && !b.transfer).length;
  const hasTransfer = blocks.some(b => b.type === 'transfer_item' || (b.type === 'retrieval_item' && b.transfer));

  return {
    valid: hasExplanation && hasComplementary && retrievalCount >= 2 && hasTransfer,
    details: {
      hasExplanation,
      hasComplementary,
      retrievalCount,
      hasTransfer
    }
  };
}

/**
 * Orchestrates a learning object into an individualized adaptive plan
 * based on learner conditions profile and empirical evidence overlay.
 *
 * @param {Object} learningObject - The raw learning object containing all blocks
 * @param {Object} profile - The LearnerConditionsProfile
 * @param {Object} [evidence] - The empirical EvidenceOverlay (if any)
 * @returns {Object} Adaptive activity payload
 */
export function orchestrateActivity(learningObject, profile = {}, evidence = {}) {
  const access = profile.access || {};
  const context = profile.context || {};
  const knowledge = profile.knowledge || {};
  const strategies = profile.strategies || {};
  const startOrder = profile.engagement_start_order || ['video', 'worked_example', 'diagram', 'reading', 'practice_with_hints'];

  const rawBlocks = JSON.parse(JSON.stringify(learningObject.blocks || []));

  // 1. Select appropriate primary explanation based on reading load
  const isSimplifiedNeeded = access.reading_load === 'needs_summary' || access.reading_load === 'needs_audio_or_simplified';
  let primaryExplanation = rawBlocks.find(b => b.type === 'explanation' && (isSimplifiedNeeded ? b.reading_level === 'plain' : b.reading_level === 'standard'));
  if (!primaryExplanation) {
    primaryExplanation = rawBlocks.find(b => b.type === 'explanation');
  }

  // Complementary alternative explanations for UDL format tray
  const alternativeExplanations = rawBlocks.filter(b => b.type === 'explanation' && b.id !== primaryExplanation?.id);

  // 2. Identify and filter core blocks
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

  // Policy 1: Novice with low self-testing -> Lead with worked example, then retrieval, delay transfer
  if (isNovice && isLowSelfTest && workedExamples.length > 0) {
    if (primaryExplanation) primarySequence.push(primaryExplanation);
    primarySequence.push(...workedExamples);
    primarySequence.push(...scaffoldedRetrieval);
  }
  // Policy 2: High hint rate evidence -> Insert worked example before retrieval
  else if (isHighHintRate && workedExamples.length > 0) {
    if (primaryExplanation) primarySequence.push(primaryExplanation);
    primarySequence.push(...workedExamples);
    primarySequence.push(...scaffoldedRetrieval);
  }
  // Policy 3: Standard UDL order guided by engagement_start_order preference
  else {
    // Map preference strings to block buckets
    const typeMapping = {
      'reading': primaryExplanation ? [primaryExplanation] : [],
      'diagram': diagrams,
      'worked_example': workedExamples,
      'video': videoBlocks,
      'practice_with_hints': scaffoldedRetrieval
    };

    // Primary explanation always anchors understanding
    if (primaryExplanation) {
      primarySequence.push(primaryExplanation);
    }

    // Add preferred complementary media next
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

    // Include retrieval items if not already added
    scaffoldedRetrieval.forEach(ret => {
      if (!primarySequence.some(b => b.id === ret.id)) {
        primarySequence.push(ret);
      }
    });
  }

  // Ensure complementary representation exists in the primary sequence
  const hasComp = primarySequence.some(b => ['diagram', 'worked_example', 'audio', 'video'].includes(b.type));
  if (!hasComp) {
    if (diagrams.length > 0) primarySequence.splice(1, 0, diagrams[0]);
    else if (workedExamples.length > 0) primarySequence.splice(1, 0, workedExamples[0]);
    else if (audioBlocks.length > 0) primarySequence.splice(1, 0, audioBlocks[0]);
    else if (videoBlocks.length > 0) primarySequence.splice(1, 0, videoBlocks[0]);
  }

  // Ensure 2 retrieval questions exist in the primary sequence
  const currentRetrievalCount = primarySequence.filter(b => b.type === 'retrieval_item' && !b.transfer).length;
  if (currentRetrievalCount < 2) {
    scaffoldedRetrieval.forEach(item => {
      if (!primarySequence.some(b => b.id === item.id)) {
        primarySequence.push(item);
      }
    });
  }

  // Add transfer item
  const primaryTransfer = transferItems[0] || {
    id: 'blk_tra_default',
    type: 'transfer_item',
    stem: 'Apply your understanding to a new real-world scenario.',
    options: ['Option A', 'Option B'],
    correct_index: 0,
    transfer: true
  };

  // Transfer item is placed at the end; if novice and low self-testing, mark gated
  const gatedTransfer = {
    ...primaryTransfer,
    gated: isNovice && isLowSelfTest,
    gated_reason: isNovice && isLowSelfTest ? 'Complete the two retrieval questions above to unlock this challenge.' : null
  };
  primarySequence.push(gatedTransfer);

  // Policy 4: Phone + low focus minutes -> Micro-chunking metadata
  const chunkingMeta = {
    is_chunked: isPhoneFocusLimited,
    max_blocks_per_step: isPhoneFocusLimited ? 2 : 5,
    recommended_focus_minutes: context.typical_focus_minutes || 20
  };

  // 5. Gather all alternative blocks for the UDL Format Tray
  // UDL Rule: Adaptation sorts and highlights; it NEVER hides other representations
  const servedIds = new Set(primarySequence.map(b => b.id));
  const alternateBlocks = rawBlocks.filter(b => !servedIds.has(b.id));

  // If audio was not placed in primary sequence and student requested audio/simplified, highlight audio in tray
  const audioInPrimary = primarySequence.some(b => b.type === 'audio');
  const needsAudioNotice = access.reading_load === 'needs_audio_or_simplified' && !audioInPrimary;

  // Verify UDL Envelope compliance
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
