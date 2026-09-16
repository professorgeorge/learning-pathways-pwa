/**
 * Client Seed Data
 * Enables the PWA to operate 100% standalone on static hosts like GitHub Pages
 * without requiring a live Node.js server.
 */

export const seedCourses = [
  {
    "course_id": "stats_101",
    "title": "Data Literacy and Statistical Reasoning",
    "description": "Master core concepts in probability, distributions, and hypothesis testing through customized learning pathways.",
    "topics": [
      {
        "topic_id": "normal_distribution",
        "title": "Standard Deviation and the Normal Distribution",
        "learning_objective": "Calculate and interpret z-scores and the Empirical Rule (68-95-99.7) to evaluate real-world spread and probability.",
        "difficulty": "intermediate",
        "prerequisites": ["basic_mean_median"],
        "estimated_minutes": 15
      },
      {
        "topic_id": "hypothesis_testing",
        "title": "Hypothesis Testing and P-Values",
        "learning_objective": "Formulate null and alternative hypotheses and interpret p-values in the context of statistical significance.",
        "difficulty": "intermediate",
        "prerequisites": ["normal_distribution"],
        "estimated_minutes": 20
      },
      {
        "topic_id": "correlation_causation",
        "title": "Correlation, Causation, and Confounding",
        "learning_objective": "Distinguish between associative correlations and causal relationships by identifying confounding variables.",
        "difficulty": "beginner",
        "prerequisites": [],
        "estimated_minutes": 12
      }
    ]
  }
];

export const seedLearningObjects = [
  {
    "object_id": "obj_normal_dist_core",
    "course_id": "stats_101",
    "topic_id": "normal_distribution",
    "learning_objective": "Calculate and interpret z-scores and the Empirical Rule (68-95-99.7) to evaluate real-world spread and probability.",
    "difficulty": "intermediate",
    "blocks": [
      {
        "id": "blk_exp_plain",
        "type": "explanation",
        "reading_level": "plain",
        "title": "Core Concept: The Bell Curve in Plain Language",
        "text": "Imagine measuring the heights of thousands of adult trees in a forest. Most trees will cluster close to an average height. A few will be unusually short, and a few will be unusually tall. When data naturally clumps around the middle like this, it forms a symmetrical bell shape known as a normal distribution.\n\nTwo numbers summarize the whole curve:\n1. The Mean (average): The exact center peak of the curve.\n2. The Standard Deviation: A measuring tape telling you how spread out the values are.\n\nThe 68-95-99.7 Rule:\n- About 68% of data falls within 1 standard deviation of the center.\n- About 95% falls within 2 standard deviations.\n- About 99.7% falls within 3 standard deviations (almost everything)."
      },
      {
        "id": "blk_exp_std",
        "type": "explanation",
        "reading_level": "standard",
        "title": "Formal Mathematical Foundations: Gaussian Distribution",
        "text": "A continuous random variable X follows a Gaussian (normal) distribution N(mu, sigma^2) where mu represents the mean and sigma represents the standard deviation. The probability density function exhibits inflection points exactly at mu - sigma and mu + sigma.\n\nKey Properties:\n- Symmetry: Mean = Median = Mode at the peak.\n- Asymptotic Tails: The tails approach zero probability but extend infinitely in both directions.\n- Standardizing via Z-score: z = (X - mu) / sigma, which expresses the position of any observation in units of standard deviation from the population mean."
      },
      {
        "id": "blk_diag_1",
        "type": "diagram",
        "title": "Interactive Diagram: Empirical Rule Areas",
        "alt": "Symmetrical bell curve showing central mean with vertical divisions at -1, -2, -3 and +1, +2, +3 standard deviations. The 68 percent interval spans between -1 and +1 sigma; 95 percent spans between -2 and +2 sigma; 99.7 percent spans between -3 and +3 sigma.",
        "svg_code": "<svg viewBox='0 0 600 260' xmlns='http://www.w3.org/2000/svg' class='diagram-svg'><defs><linearGradient id='grad68' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#6366f1' stop-opacity='0.6'/><stop offset='100%' stop-color='#6366f1' stop-opacity='0.15'/></linearGradient><linearGradient id='grad95' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#06b6d4' stop-opacity='0.4'/><stop offset='100%' stop-color='#06b6d4' stop-opacity='0.1'/></linearGradient></defs><rect width='100%' height='100%' rx='12' fill='var(--card-subtle-bg, #1e2230)'/><path d='M 40,220 Q 200,220 250,140 Q 300,30 350,140 Q 400,220 560,220' fill='none' stroke='#818cf8' stroke-width='3'/><path d='M 230,220 L 230,125 Q 300,30 370,125 L 370,220 Z' fill='url(#grad68)'/><line x1='300' y1='30' x2='300' y2='220' stroke='#f43f5e' stroke-width='2' stroke-dasharray='4,4'/><line x1='40' y1='220' x2='560' y2='220' stroke='#64748b' stroke-width='2'/><text x='300' y='240' text-anchor='middle' fill='#cbd5e1' font-size='13'>Mean (mu)</text><text x='230' y='240' text-anchor='middle' fill='#94a3b8' font-size='12'>-1 sigma</text><text x='370' y='240' text-anchor='middle' fill='#94a3b8' font-size='12'>+1 sigma</text><text x='160' y='240' text-anchor='middle' fill='#64748b' font-size='12'>-2 sigma</text><text x='440' y='240' text-anchor='middle' fill='#64748b' font-size='12'>+2 sigma</text><rect x='250' y='145' width='100' height='26' rx='6' fill='#312e81'/><text x='300' y='163' text-anchor='middle' fill='#e0e7ff' font-weight='bold' font-size='13'>68% of data</text><text x='300' y='200' text-anchor='middle' fill='#38bdf8' font-size='12'>95% within +/- 2 sigma</text></svg>"
      },
      {
        "id": "blk_audio_1",
        "type": "audio",
        "title": "Audio Overview: Intuitive Sound Walkthrough",
        "url": "/audio/normal_distribution_overview.mp3",
        "transcript": "Hello and welcome to this quick audio guide on the normal distribution. Let us imagine you are waiting for a train. On average it takes 20 minutes with a standard deviation of 2 minutes. What does that mean? Under the empirical rule, 68 percent of the time your wait will be between 18 and 22 minutes (within 1 standard deviation). 95 percent of the time your wait will be between 16 and 24 minutes (within 2 standard deviations). Very rarely, less than 0.3 percent of the time, will it arrive outside 14 to 26 minutes.",
        "has_tts": true
      },
      {
        "id": "blk_video_1",
        "type": "video",
        "title": "Visual Walkthrough: Z-Score Transformation",
        "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "captions_url": "/captions/zscore_walkthrough.vtt",
        "transcript": "In this video walkthrough, we demonstrate how calculating z = (value - mean) divided by standard deviation lets us compare variables with completely different original units, such as exam test scores versus heights."
      },
      {
        "id": "blk_work_1",
        "type": "worked_example",
        "title": "Worked Example: Analyzing Exam Scores",
        "problem_statement": "A university chemistry exam has a mean score of mu = 70 points and a standard deviation of sigma = 5 points. The exam results follow a normal distribution. What percentage of students scored between 65 and 80 points?",
        "steps": [
          {
            "step_number": 1,
            "heading": "Identify the given values and standard deviation bounds",
            "explanation": "The mean is 70 points. Each standard deviation interval is 5 points:\n- 1 sigma above = 70 + 5 = 75 points.\n- 2 sigma above = 70 + 10 = 80 points.\n- 1 sigma below = 70 - 5 = 65 points."
          },
          {
            "step_number": 2,
            "heading": "Decompose the desired score range (65 to 80)",
            "explanation": "The range spans from -1 sigma (65) up to +2 sigma (80). Notice this is asymmetrical around the mean, so we break it into two halves:\n- Half A: From 65 to 70 (-1 sigma to mean)\n- Half B: From 70 to 80 (mean to +2 sigma)"
          },
          {
            "step_number": 3,
            "heading": "Apply the Empirical Rule percentages",
            "explanation": "Because the distribution is symmetrical:\n- The interval from -1 sigma to +1 sigma contains 68% of data. Therefore, from -1 sigma to the mean is 68% / 2 = 34%.\n- The interval from -2 sigma to +2 sigma contains 95% of data. Therefore, from the mean to +2 sigma is 95% / 2 = 47.5%."
          },
          {
            "step_number": 4,
            "heading": "Combine the regions to find the final total",
            "explanation": "Total percentage = 34% + 47.5% = 81.5% of students scored between 65 and 80 points."
          }
        ],
        "reflection_prompt": "Before moving on: Why did we divide by 2 for each half instead of adding 68% and 95% together directly?"
      },
      {
        "id": "blk_ret_1",
        "type": "retrieval_item",
        "stem": "Under the Empirical Rule (68-95-99.7), what percentage of values in a normal distribution fall within 2 standard deviations of the mean?",
        "options": [
          "Approximately 50%",
          "Approximately 68%",
          "Approximately 95%",
          "Approximately 99.7%"
        ],
        "correct_index": 2,
        "explanation": "Correct! The Empirical Rule states that approximately 68% of data falls within 1 standard deviation, approximately 95% falls within 2 standard deviations, and approximately 99.7% falls within 3 standard deviations.",
        "hint": "Remember the three numbers in order: 1 sigma is 68%, 2 sigma is the next tier.",
        "transfer": false
      },
      {
        "id": "blk_ret_2",
        "type": "retrieval_item",
        "stem": "If a student scores at z = -1.0 on a test with mean 80 and standard deviation 6, what was their actual raw score?",
        "options": [
          "74 points",
          "86 points",
          "80 points",
          "68 points"
        ],
        "correct_index": 0,
        "explanation": "Correct! A z-score of -1.0 means exactly 1 standard deviation below the mean: 80 - (1 * 6) = 74 points.",
        "hint": "A negative z-score means the score is below the mean by that many standard deviations.",
        "transfer": false
      },
      {
        "id": "blk_tra_1",
        "type": "transfer_item",
        "stem": "Transfer Challenge: A quality assurance lab tests lightbulbs with an average lifespan of 1,000 hours and a standard deviation of 50 hours (normally distributed). The manufacturer offers a free replacement for any bulb that lasts under 900 hours. Out of 10,000 manufactured bulbs, approximately how many will need replacement?",
        "options": [
          "About 25 bulbs",
          "About 250 bulbs",
          "About 500 bulbs",
          "About 1,000 bulbs"
        ],
        "correct_index": 1,
        "explanation": "Outstanding reasoning! 900 hours corresponds to 2 standard deviations below the mean (1000 - 2 * 50 = 900, so z = -2.0). We know 95% of bulbs fall between -2 and +2 standard deviations, leaving 5% outside in total. Because the curve is symmetrical, half of that 5% (2.5%) falls below 900 hours. 2.5% of 10,000 bulbs equals 250 bulbs.",
        "hint": "Calculate the z-score for 900 hours first. Then calculate the lower tail outside the 95% interval.",
        "transfer": true
      }
    ],
    "accessibility": {
      "has_captions": true,
      "has_transcript": true,
      "has_alt": true,
      "estimated_minutes": 15
    },
    "origin": "human",
    "review_status": "approved"
  }
];
