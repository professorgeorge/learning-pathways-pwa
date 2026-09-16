/**
 * Practice View: Retrieval Practice Gym
 * Provides spaced retrieval practice to support low self-testing students.
 */

import { renderRetrievalItem, setupRetrievalHandlers } from '../components/RetrievalItem.js';
import { postTelemetryEvent } from '../api/client.js';

export function renderPracticeView(questions = []) {
  const practiceQuestions = questions.length > 0 ? questions : [
    {
      id: 'blk_ret_1',
      type: 'retrieval_item',
      stem: 'Under the Empirical Rule (68-95-99.7), what percentage of values in a normal distribution fall within 2 standard deviations of the mean?',
      options: ['Approximately 50%', 'Approximately 68%', 'Approximately 95%', 'Approximately 99.7%'],
      correct_index: 2,
      explanation: 'Approximately 95% of observations in a normal distribution fall within 2 standard deviations (+/- 2 sigma) of the mean.',
      hint: 'Remember the tier sequence: 1 sigma is 68%, 2 sigma is the middle tier.',
      scaffold_prompt: 'Try answering without looking back at notes to build strong retrieval memory.'
    },
    {
      id: 'blk_ret_2',
      type: 'retrieval_item',
      stem: 'If a student scores at z = -1.0 on a test with mean 80 and standard deviation 6, what was their actual raw score?',
      options: ['74 points', '86 points', '80 points', '68 points'],
      correct_index: 0,
      explanation: 'A z-score of -1.0 means exactly 1 standard deviation below the mean: 80 - 6 = 74 points.',
      hint: 'A negative z-score indicates a value below the mean.'
    },
    {
      id: 'blk_ret_hyp_1',
      type: 'retrieval_item',
      stem: 'Which of the following is the most accurate definition of a p-value?',
      options: [
        'The probability that the null hypothesis is true.',
        'The probability of obtaining results at least as extreme as observed, assuming the null hypothesis is true.',
        'The probability that the researcher made a mathematical error.',
        'The percentage of people who benefited from the experimental treatment.'
      ],
      correct_index: 1,
      explanation: 'A p-value measures how unusual the sample data would be under the assumption that the null hypothesis holds true.',
      hint: 'Remember the courtroom trial analogy: assume innocence (H0) first.'
    }
  ];

  const questionsHtml = practiceQuestions.map((q, idx) => renderRetrievalItem(q, idx + 1)).join('');

  return `
    <div class="view-container">
      <div style="margin-bottom:1.5rem;">
        <span class="block-badge" style="background:rgba(99,102,241,0.2); color:#a5b4fc; margin-bottom:0.4rem; display:inline-block;">
          Retrieval Gym
        </span>
        <h2 style="font-family:var(--font-display); font-size:1.6rem; color:#f8fafc; margin-bottom:0.35rem;">
          Active Retrieval Practice
        </h2>
        <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.5;">
          Practicing retrieval without looking at notes is one of the most effective ways to solidify durable memory and long-term mastery.
        </p>
      </div>

      <div class="card" style="background:rgba(99, 102, 241, 0.08); border:1px solid rgba(99, 102, 241, 0.25); margin-bottom:1.5rem; padding:1rem 1.25rem;">
        <div style="font-size:0.875rem; color:#cbd5e1; line-height:1.5;">
          💡 <strong>Metacognitive Scaffolding:</strong> If your Learner Profile recorded lower self-testing frequency, these short low-stakes checks will strengthen your recall speed without test anxiety.
        </div>
      </div>

      <div id="practice-items-container">
        ${questionsHtml}
      </div>

      <div style="text-align:center; margin-top:2rem;">
        <a href="#/progress" class="btn btn-primary">
          Check Updated Mastery Score →
        </a>
      </div>
    </div>
  `;
}

export function setupPracticeViewHandlers(container) {
  setupRetrievalHandlers(container, event => {
    postTelemetryEvent('obj_normal_dist_core', 'normal_distribution', event);
  });
}
