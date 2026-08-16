import type {
  Test,
  Question,
  Passage,
  VocabularyWord,
  Mistake,
  Achievement,
  DashboardData,
  PricingPlan,
} from './types';

export const tests: Test[] = [
  {
    id: 't1',
    title: 'Academic Reading Practice Test 1',
    skill: 'reading',
    examType: 'academic',
    difficulty: 'medium',
    questionCount: 40,
    estimatedMinutes: 60,
    bestScore: 7.0,
    status: 'completed',
    description: 'Three passages covering academic topics with 40 questions across multiple question types.',
  },
  {
    id: 't2',
    title: 'Academic Reading Practice Test 2',
    skill: 'reading',
    examType: 'academic',
    difficulty: 'hard',
    questionCount: 40,
    estimatedMinutes: 60,
    status: 'not_started',
    description: 'Advanced level passages with complex argument structures and inference-based questions.',
  },
  {
    id: 't3',
    title: 'General Training Reading Practice Test 1',
    skill: 'reading',
    examType: 'general',
    difficulty: 'easy',
    questionCount: 40,
    estimatedMinutes: 60,
    status: 'not_started',
    description: 'Everyday English passages including notices, advertisements, and workplace documents.',
  },
  {
    id: 't4',
    title: 'Listening Practice Test 1',
    skill: 'listening',
    examType: 'academic',
    difficulty: 'medium',
    questionCount: 40,
    estimatedMinutes: 40,
    bestScore: 7.5,
    status: 'completed',
    description: 'Four sections covering social survival, educational, and academic listening scenarios.',
  },
  {
    id: 't5',
    title: 'Listening Practice Test 2',
    skill: 'listening',
    examType: 'academic',
    difficulty: 'medium',
    questionCount: 40,
    estimatedMinutes: 40,
    status: 'not_started',
    description: 'Practice with British, Australian, and American accents across all four sections.',
  },
  {
    id: 't6',
    title: 'Academic Writing Task 1 — Data Description',
    skill: 'writing',
    examType: 'academic',
    difficulty: 'medium',
    questionCount: 1,
    estimatedMinutes: 20,
    status: 'not_started',
    description: 'Describe visual data (graphs, charts, diagrams) in a formal academic report.',
  },
  {
    id: 't7',
    title: 'Writing Task 2 — Opinion Essay',
    skill: 'writing',
    examType: 'academic',
    difficulty: 'hard',
    questionCount: 1,
    estimatedMinutes: 40,
    status: 'not_started',
    description: 'Write a formal essay presenting and supporting your opinion on a given topic.',
  },
  {
    id: 't8',
    title: 'Speaking Practice — Full Mock Interview',
    skill: 'speaking',
    examType: 'academic',
    difficulty: 'medium',
    questionCount: 3,
    estimatedMinutes: 15,
    status: 'not_started',
    description: 'Complete speaking simulation covering Part 1, Part 2, and Part 3 with AI feedback.',
  },
  {
    id: 't9',
    title: 'Full Mock Exam — Academic',
    skill: 'mock',
    examType: 'academic',
    difficulty: 'hard',
    questionCount: 84,
    estimatedMinutes: 180,
    status: 'not_started',
    description: 'Complete IELTS simulation: Listening, Reading, and Writing under real exam conditions.',
  },
  {
    id: 't10',
    title: 'Full Mock Exam — General Training',
    skill: 'mock',
    examType: 'general',
    difficulty: 'hard',
    questionCount: 84,
    estimatedMinutes: 180,
    bestScore: 6.5,
    status: 'completed',
    description: 'Full General Training simulation with all four sections under timed conditions.',
  },
  {
    id: 't11',
    title: 'Academic Reading — Short Practice',
    skill: 'reading',
    examType: 'academic',
    difficulty: 'easy',
    questionCount: 13,
    estimatedMinutes: 20,
    status: 'not_started',
    description: 'Single passage with 13 questions. Perfect for quick daily practice.',
  },
  {
    id: 't12',
    title: 'General Training Writing Task 1 — Letter',
    skill: 'writing',
    examType: 'general',
    difficulty: 'easy',
    questionCount: 1,
    estimatedMinutes: 20,
    status: 'not_started',
    description: 'Write a formal, semi-formal, or informal letter based on a given situation.',
  },
];

export const passages: Record<string, Passage> = {
  p1: {
    id: 'p1',
    title: 'The Remarkable Navigation Abilities of Arctic Terns',
    content: `The Arctic tern (Sterna paradisaea) is a seabird species that performs the longest migration of any animal on Earth. Each year, these remarkable birds travel from their Arctic breeding grounds to the Antarctic and back again, a round trip of approximately 71,000 kilometres (44,000 miles). This extraordinary journey has fascinated scientists for decades, and recent research has begun to reveal the sophisticated navigation mechanisms that make it possible.

Early studies of Arctic tern migration relied on traditional banding techniques, which could only reveal the start and end points of the journey. However, the development of lightweight geolocators — devices weighing less than 1 gram — has allowed researchers to track the birds' entire migration route. These devices record light levels, from which latitude and longitude can be estimated, providing a detailed picture of the terns' movements.

One of the most surprising findings from this tracking research was that Arctic terns do not take the most direct route south. Instead, they make a stopover in the North Atlantic, an area of the ocean known as the North Atlantic gyre, where they spend considerable time feeding. This stopover is believed to be crucial for building up the fat reserves needed for the long journey ahead. The birds then follow one of two main routes: a western route along the coast of South America, or an eastern route along the coast of Africa.

The choice of route appears to be influenced by wind patterns. Arctic terns are relatively small birds, weighing only about 100 grams, and they rely heavily on prevailing winds to conserve energy during migration. Researchers have found that birds departing from different breeding grounds in the Arctic tend to follow different routes, suggesting that the choice is not random but is instead determined by the prevailing wind conditions at the time of departure.

Navigation over such vast distances requires more than just following the wind. Scientists believe that Arctic terns, like many other migratory birds, use a combination of navigational cues. These include the position of the sun, the Earth's magnetic field, visual landmarks such as coastlines, and possibly even the stars. The relative importance of each cue may vary depending on the conditions the bird encounters during its journey.

Research conducted on related tern species has shown that these birds possess a specialized protein called cryptochrome in their retinas. This protein is sensitive to magnetic fields and may allow the birds to "see" the Earth's magnetic field in some way. While this has not been directly demonstrated in Arctic terns, the presence of similar proteins in closely related species suggests that they may share this ability.

The timing of the migration is also remarkable. Arctic terns time their arrival in the Antarctic to coincide with the austral summer, when food is abundant. They then time their return to the Arctic to arrive for the boreal summer breeding season. This means that the birds experience two summers each year and more daylight than any other animal on the planet.

Climate change may pose a significant threat to Arctic terns by disrupting the delicate timing of their migration. If the availability of food at stopover sites shifts due to changing ocean temperatures, the birds may find that their traditional feeding grounds are no longer productive when they arrive. This could have serious consequences for a species that depends on building up sufficient fat reserves at specific points along its migration route.

Conservation of Arctic terns is complicated by the fact that they traverse the territories of many different countries during their migration. International cooperation is therefore essential for their protection. The Agreement on the Conservation of African-Eurasian Migratory Waterbirds (AEWA) is one framework that aims to protect species like the Arctic tern across their migratory range.`,
    wordCount: 528,
  },
};

export const questions: Record<string, Question[]> = {
  t1: [
    {
      id: 'q1',
      type: 'multiple_choice',
      questionNumber: 1,
      prompt: 'According to the passage, what is the approximate length of the Arctic tern\'s annual migration?',
      options: [
        '44,000 miles',
        '71,000 miles',
        '100,000 kilometres',
        '44,000 kilometres',
      ],
      correctAnswer: '44,000 miles',
      explanation:
        'The passage states the round trip is approximately 71,000 kilometres (44,000 miles). Option A gives the correct figure in miles.',
      difficulty: 'easy',
      category: 'factual',
      passageId: 'p1',
    },
    {
      id: 'q2',
      type: 'true_false_not_given',
      questionNumber: 2,
      prompt: 'Arctic terns take the most direct route from the Arctic to the Antarctic.',
      correctAnswer: 'False',
      explanation:
        'The passage states that Arctic terns "do not take the most direct route south" and instead make a stopover in the North Atlantic.',
      difficulty: 'easy',
      category: 'factual',
      passageId: '1',
    },
    {
      id: 'q3',
      type: 'true_false_not_given',
      questionNumber: 3,
      prompt: 'Arctic terns weigh approximately 100 grams.',
      correctAnswer: 'True',
      explanation:
        'The passage explicitly states "Arctic terns are relatively small birds, weighing only about 100 grams."',
      difficulty: 'easy',
      category: 'factual',
      passageId: 'p1',
    },
    {
      id: 'q4',
      type: 'true_false_not_given',
      questionNumber: 4,
      prompt: 'Arctic terns are the only bird species that uses cryptochrome in their retinas.',
      correctAnswer: 'Not Given',
      explanation:
        'The passage mentions cryptochrome in related tern species but does not claim Arctic terns are the only species with this protein.',
      difficulty: 'medium',
      category: 'inference',
      passageId: 'p1',
    },
    {
      id: 'q5',
      type: 'sentence_completion',
      questionNumber: 5,
      prompt: 'Complete the sentence: The choice of migration route appears to be influenced by ________.',
      correctAnswer: 'wind patterns',
      explanation:
        'The passage states "The choice of route appears to be influenced by wind patterns."',
      difficulty: 'easy',
      category: 'factual',
      passageId: 'p1',
    },
    {
      id: 'q6',
      type: 'sentence_completion',
      questionNumber: 6,
      prompt: 'Complete the sentence: The protein in the retinas of terns that may allow them to detect magnetic fields is called ________.',
      correctAnswer: 'cryptochrome',
      explanation:
        'The passage mentions "a specialized protein called cryptochrome in their retinas" that is sensitive to magnetic fields.',
      difficulty: 'medium',
      category: 'factual',
      passageId: 'p1',
    },
    {
      id: 'q7',
      type: 'multiple_choice',
      questionNumber: 7,
      prompt: 'Why do Arctic terns make a stopover in the North Atlantic?',
      options: [
        'To avoid predators',
        'To build up fat reserves for the journey',
        'To wait for favorable wind conditions',
        'To breed during the migration',
      ],
      correctAnswer: 'To build up fat reserves for the journey',
      explanation:
        'The passage states the stopover "is believed to be crucial for building up the fat reserves needed for the long journey ahead."',
      difficulty: 'medium',
      category: 'factual',
      passageId: 'p1',
    },
    {
      id: 'q8',
      type: 'yes_no_not_given',
      questionNumber: 8,
      prompt: 'Climate change could disrupt the feeding schedule of Arctic terns at their stopover sites.',
      correctAnswer: 'Yes',
      explanation:
        'The passage states that if food availability shifts due to changing ocean temperatures, birds may find traditional feeding grounds unproductive upon arrival.',
      difficulty: 'medium',
      category: 'inference',
      passageId: 'p1',
    },
    {
      id: 'q9',
      type: 'yes_no_not_given',
      questionNumber: 9,
      prompt: 'The AEWA agreement has been successful in increasing Arctic tern populations.',
      correctAnswer: 'Not Given',
      explanation:
        'The passage mentions AEWA as a conservation framework but does not state whether it has been successful in increasing populations.',
      difficulty: 'hard',
      category: 'inference',
      passageId: 'p1',
    },
    {
      id: 'q10',
      type: 'short_answer',
      questionNumber: 10,
      prompt: 'How many summers do Arctic terns experience each year?',
      correctAnswer: 'two',
      explanation:
        'The passage states "This means that the birds experience two summers each year."',
      difficulty: 'easy',
      category: 'factual',
      passageId: 'p1',
    },
    {
      id: 'q11',
      type: 'short_answer',
      questionNumber: 11,
      prompt: 'What technology allowed researchers to track the entire migration route of Arctic terns?',
      correctAnswer: 'geolocators',
      explanation:
        'The passage credits "lightweight geolocators — devices weighing less than 1 gram" for enabling detailed tracking.',
      difficulty: 'medium',
      category: 'factual',
      passageId: 'p1',
    },
    {
      id: 'q12',
      type: 'matching_headings',
      questionNumber: 12,
      prompt: 'Which heading best fits the paragraph about climate change threats?',
      options: [
        'i. International Cooperation for Conservation',
        'ii. The Impact of Environmental Change',
        'iii. Navigation Mechanisms of Arctic Terns',
        'iv. The Role of Wind in Migration',
      ],
      correctAnswer: 'ii. The Impact of Environmental Change',
      explanation:
        'The paragraph discusses how climate change may disrupt migration timing and food availability, fitting the heading about environmental change impact.',
      difficulty: 'hard',
      category: 'main_idea',
      passageId: 'p1',
    },
    {
      id: 'q13',
      type: 'summary_completion',
      questionNumber: 13,
      prompt: 'Complete the summary: Arctic terns use various navigational cues including the sun, magnetic field, visual landmarks, and possibly ________.',
      correctAnswer: 'the stars',
      explanation:
        'The passage lists "the position of the sun, the Earth\'s magnetic field, visual landmarks such as coastlines, and possibly even the stars."',
      difficulty: 'medium',
      category: 'factual',
      passageId: 'p1',
    },
  ],
};

export const vocabularyWords: VocabularyWord[] = [
  {
    id: 'v1',
    word: 'ubiquitous',
    definition: 'Present, appearing, or found everywhere',
    example: 'Mobile phones have become ubiquitous in modern society.',
    synonyms: ['omnipresent', 'pervasive', 'universal', 'widespread'],
    wordFamily: [
      { form: 'adjective', word: 'ubiquitous' },
      { form: 'adverb', word: 'ubiquitously' },
      { form: 'noun', word: 'ubiquity' },
    ],
    difficulty: 'hard',
    category: 'academic',
  },
  {
    id: 'v2',
    word: 'mitigate',
    definition: 'To make less severe, harmful, or painful',
    example: 'The government introduced policies to mitigate the effects of the economic downturn.',
    synonyms: ['alleviate', 'reduce', 'diminish', 'lessen'],
    wordFamily: [
      { form: 'verb', word: 'mitigate' },
      { form: 'noun', word: 'mitigation' },
      { form: 'adjective', word: 'mitigative' },
    ],
    difficulty: 'medium',
    category: 'academic',
  },
  {
    id: 'v3',
    word: 'deteriorate',
    definition: 'To become progressively worse',
    example: 'The patient\'s condition began to deteriorate rapidly after surgery.',
    synonyms: ['worsen', 'decline', 'degrade', 'disintegrate'],
    wordFamily: [
      { form: 'verb', word: 'deteriorate' },
      { form: 'noun', word: 'deterioration' },
    ],
    difficulty: 'medium',
    category: 'academic',
  },
  {
    id: 'v4',
    word: 'comprehensive',
    definition: 'Complete and including all elements or aspects',
    example: 'The report provides a comprehensive analysis of the company\'s financial performance.',
    synonyms: ['thorough', 'complete', 'exhaustive', 'all-inclusive'],
    wordFamily: [
      { form: 'adjective', word: 'comprehensive' },
      { form: 'adverb', word: 'comprehensively' },
      { form: 'noun', word: 'comprehensiveness' },
    ],
    difficulty: 'easy',
    category: 'academic',
  },
  {
    id: 'v5',
    word: 'scrutinize',
    definition: 'To examine or inspect closely and thoroughly',
    example: 'The committee scrutinized every detail of the proposal before making a decision.',
    synonyms: ['examine', 'inspect', 'analyze', 'investigate'],
    wordFamily: [
      { form: 'verb', word: 'scrutinize' },
      { form: 'noun', word: 'scrutiny' },
    ],
    difficulty: 'hard',
    category: 'academic',
  },
  {
    id: 'v6',
    word: 'predominantly',
    definition: 'Mainly or for the most part',
    example: 'The audience was predominantly young professionals.',
    synonyms: ['mainly', 'mostly', 'primarily', 'chiefly'],
    wordFamily: [
      { form: 'adverb', word: 'predominantly' },
      { form: 'adjective', word: 'predominant' },
      { form: 'noun', word: 'predominance' },
    ],
    difficulty: 'medium',
    category: 'academic',
  },
  {
    id: 'v7',
    word: 'feasible',
    definition: 'Possible to do easily or conveniently',
    example: 'The engineers determined that the bridge design was technically feasible.',
    synonyms: ['possible', 'viable', 'achievable', 'practical'],
    wordFamily: [
      { form: 'adjective', word: 'feasible' },
      { form: 'adverb', word: 'feasibly' },
      { form: 'noun', word: 'feasibility' },
    ],
    difficulty: 'easy',
    category: 'academic',
  },
  {
    id: 'v8',
    word: 'paradigm',
    definition: 'A typical example or pattern of something; a model',
    example: 'The discovery represented a paradigm shift in our understanding of the universe.',
    synonyms: ['model', 'pattern', 'template', 'standard'],
    wordFamily: [
      { form: 'noun', word: 'paradigm' },
      { form: 'adjective', word: 'paradigmatic' },
    ],
    difficulty: 'hard',
    category: 'academic',
  },
  {
    id: 'v9',
    word: 'resilient',
    definition: 'Able to withstand or recover quickly from difficult conditions',
    example: 'Children are often more resilient than adults give them credit for.',
    synonyms: ['tough', 'strong', 'hardy', 'durable'],
    wordFamily: [
      { form: 'adjective', word: 'resilient' },
      { form: 'adverb', word: 'resiliently' },
      { form: 'noun', word: 'resilience' },
    ],
    difficulty: 'medium',
    category: 'academic',
  },
  {
    id: 'v10',
    word: 'consequence',
    definition: 'A result or effect, typically one that is unwelcome',
    example: 'The consequences of climate change are becoming increasingly visible.',
    synonyms: ['result', 'outcome', 'effect', 'ramification'],
    wordFamily: [
      { form: 'noun', word: 'consequence' },
      { form: 'adjective', word: 'consequent' },
      { form: 'adverb', word: 'consequently' },
    ],
    difficulty: 'easy',
    category: 'academic',
  },
  {
    id: 'v11',
    word: 'advocate',
    definition: 'To publicly recommend or support',
    example: 'Many doctors advocate for a balanced diet and regular exercise.',
    synonyms: ['support', 'endorse', 'promote', 'champion'],
    wordFamily: [
      { form: 'verb', word: 'advocate' },
      { form: 'noun', word: 'advocacy' },
      { form: 'noun', word: 'advocate' },
    ],
    difficulty: 'medium',
    category: 'academic',
  },
  {
    id: 'v12',
    word: 'inevitable',
    definition: 'Certain to happen; unavoidable',
    example: 'Given the economic conditions, some job losses were inevitable.',
    synonyms: ['unavoidable', 'inescapable', 'certain', 'destined'],
    wordFamily: [
      { form: 'adjective', word: 'inevitable' },
      { form: 'adverb', word: 'inevitably' },
      { form: 'noun', word: 'inevitability' },
    ],
    difficulty: 'easy',
    category: 'academic',
  },
];

export const mistakes: Mistake[] = [
  {
    id: 'm1',
    question: 'Arctic terns take the most direct route from the Arctic to the Antarctic.',
    yourAnswer: 'True',
    correctAnswer: 'False',
    explanation:
      'The passage states that Arctic terns do not take the most direct route south and instead make a stopover in the North Atlantic.',
    category: 'factual',
    difficulty: 'easy',
    skill: 'reading',
    mastered: false,
    createdAt: '2026-08-10T10:30:00Z',
  },
  {
    id: 'm2',
    question: 'What technology allowed researchers to track the entire migration route?',
    yourAnswer: 'GPS trackers',
    correctAnswer: 'geolocators',
    explanation:
      'The passage specifically credits lightweight geolocators, not GPS trackers, for enabling detailed migration tracking.',
    category: 'factual',
    difficulty: 'medium',
    skill: 'reading',
    mastered: false,
    createdAt: '2026-08-11T14:15:00Z',
  },
  {
    id: 'm3',
    question: 'Complete: Arctic terns use various navigational cues including the sun, magnetic field, visual landmarks, and possibly ________.',
    yourAnswer: 'the moon',
    correctAnswer: 'the stars',
    explanation:
      'The passage lists "the position of the sun, the Earth\'s magnetic field, visual landmarks such as coastlines, and possibly even the stars."',
    category: 'factual',
    difficulty: 'medium',
    skill: 'reading',
    mastered: true,
    createdAt: '2026-08-05T09:00:00Z',
  },
  {
    id: 'm4',
    question: 'Listening Section 3: What does the student decide to focus on for the research project?',
    yourAnswer: 'Environmental impact',
    correctAnswer: 'Economic factors affecting small businesses',
    explanation:
      'In the conversation, the student initially considers environmental impact but ultimately decides to focus on economic factors after discussion with the tutor.',
    category: 'detail',
    difficulty: 'medium',
    skill: 'listening',
    mastered: false,
    createdAt: '2026-08-12T16:45:00Z',
  },
];

export const achievements: Achievement[] = [
  { id: 'a1', title: 'First Test', description: 'Complete your first practice test', icon: 'flag', unlocked: true, date: '2026-07-15' },
  { id: 'a2', title: '7.0 Club', description: 'Score 7.0 or higher on any test', icon: 'award', unlocked: true, date: '2026-07-20' },
  { id: 'a3', title: '7.5 Club', description: 'Score 7.5 or higher on any test', icon: 'trophy', unlocked: true, date: '2026-07-28' },
  { id: 'a4', title: '8.0 Club', description: 'Score 8.0 or higher on any test', icon: 'crown', unlocked: false },
  { id: 'a5', title: '10 Tests Completed', description: 'Complete 10 practice tests', icon: 'book-open', unlocked: false },
  { id: 'a6', title: '30 Days Streak', description: 'Practice for 30 consecutive days', icon: 'flame', unlocked: false },
  { id: 'a7', title: '100 Questions', description: 'Answer 100 questions correctly', icon: 'check-circle', unlocked: true, date: '2026-08-01' },
  { id: 'a8', title: 'Perfect Listening', description: 'Get all listening questions correct', icon: 'headphones', unlocked: false },
  { id: 'a9', title: 'Perfect Reading', description: 'Get all reading questions correct', icon: 'book', unlocked: false },
];

export const dashboardData: DashboardData = {
  userName: 'Aziz',
  targetBand: 7.5,
  currentBand: 6.5,
  examCountdownDays: 23,
  skillBands: [
    { skill: 'reading', band: 7.0, target: 7.5 },
    { skill: 'listening', band: 7.5, target: 8.0 },
    { skill: 'writing', band: 6.0, target: 7.0 },
    { skill: 'speaking', band: 6.5, target: 7.0 },
  ],
  progressHistory: [
    { date: 'Jul 1', overall: 5.5 },
    { date: 'Jul 8', overall: 5.8 },
    { date: 'Jul 15', overall: 6.0 },
    { date: 'Jul 22', overall: 6.2 },
    { date: 'Jul 29', overall: 6.3 },
    { date: 'Aug 5', overall: 6.4 },
    { date: 'Aug 12', overall: 6.5 },
  ],
  totalTests: 8,
  averageBand: 6.5,
  bestBand: 7.5,
  weakestSkill: 'writing',
  accuracy: 72,
  timeSpentHours: 47,
  weeklyActivity: [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 60 },
    { day: 'Wed', minutes: 30 },
    { day: 'Thu', minutes: 90 },
    { day: 'Fri', minutes: 0 },
    { day: 'Sat', minutes: 120 },
    { day: 'Sun', minutes: 75 },
  ],
  streak: 12,
};

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, quarterly: 0, halfYearly: 0, yearly: 0 },
    description: 'Get started with essential IELTS practice tools.',
    features: [
      '3 practice tests per month',
      'Basic analytics dashboard',
      'Limited vocabulary practice',
      'Reading and Listening practice',
      'Band score calculator',
    ],
    highlighted: false,
    cta: 'Start free',
  },
  {
    id: 'plus',
    name: 'Plus',
    price: { monthly: 99000, quarterly: 249000, halfYearly: 449000, yearly: 799000 },
    description: 'Everything you need for serious IELTS preparation.',
    features: [
      'Full test library access',
      'Unlimited practice tests',
      'Full mock exams',
      'Advanced analytics',
      'Writing AI evaluation',
      'Speaking AI evaluation',
      'Mistakes review system',
      'Progress tracking',
    ],
    highlighted: true,
    cta: 'Get Plus',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 199000, quarterly: 499000, halfYearly: 899000, yearly: 1599000 },
    description: 'Maximum preparation with AI coaching and personalized plans.',
    features: [
      'Everything in Plus',
      'Unlimited AI evaluations',
      'AI IELTS Coach',
      'Personalized study plan',
      'Advanced progress analytics',
      'Full Speaking simulator',
      'Priority support',
      'Early access to new features',
    ],
    highlighted: false,
    cta: 'Get Pro',
  },
];

export function formatUZS(amount: number): string {
  if (amount === 0) return 'Free';
  return new Intl.NumberFormat('en-US').format(amount) + ' UZS';
}

export const bandScoreChart = [
  { correct: 1, band: 1.0 },
  { correct: 2, band: 2.0 },
  { correct: 3, band: 2.5 },
  { correct: 4, band: 3.0 },
  { correct: 5, band: 3.5 },
  { correct: 6, band: 3.5 },
  { correct: 7, band: 4.0 },
  { correct: 8, band: 4.0 },
  { correct: 9, band: 4.5 },
  { correct: 10, band: 4.5 },
  { correct: 11, band: 5.0 },
  { correct: 12, band: 5.0 },
  { correct: 13, band: 5.5 },
  { correct: 14, band: 5.5 },
  { correct: 15, band: 6.0 },
  { correct: 16, band: 6.0 },
  { correct: 17, band: 6.0 },
  { correct: 18, band: 6.5 },
  { correct: 19, band: 6.5 },
  { correct: 20, band: 6.5 },
  { correct: 21, band: 7.0 },
  { correct: 22, band: 7.0 },
  { correct: 23, band: 7.0 },
  { correct: 24, band: 7.5 },
  { correct: 25, band: 7.5 },
  { correct: 26, band: 7.5 },
  { correct: 27, band: 8.0 },
  { correct: 28, band: 8.0 },
  { correct: 29, band: 8.0 },
  { correct: 30, band: 8.5 },
  { correct: 31, band: 8.5 },
  { correct: 32, band: 8.5 },
  { correct: 33, band: 9.0 },
  { correct: 34, band: 9.0 },
  { correct: 35, band: 9.0 },
  { correct: 36, band: 9.0 },
  { correct: 37, band: 9.0 },
  { correct: 38, band: 9.0 },
  { correct: 39, band: 9.0 },
  { correct: 40, band: 9.0 },
];

export function calculateBandScore(correct: number, total: number = 40): number {
  const entry = bandScoreChart.find((e) => e.correct === correct);
  if (entry) return entry.band;
  const ratio = correct / total;
  return Math.round(ratio * 9 * 2) / 2;
}

export function cefrFromBand(band: number): string {
  if (band >= 8.5) return 'C2';
  if (band >= 7.5) return 'C1';
  if (band >= 6.5) return 'B2';
  if (band >= 5.5) return 'B1';
  if (band >= 4.0) return 'A2';
  return 'A1';
}
