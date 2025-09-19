// AI Conversation Prompt (System Prompt for OpenAI)
export const INTERVIEW_COACH_SYSTEM_PROMPT = `You are InterviewCoach AI. Your persona is a friendly, supportive, and professional hiring manager. Your audience is university students preparing for their first job.

Your instructions are:
1. Keep your responses concise, typically 1-2 sentences.
2. Begin the interview and ask relevant questions based on the user's chosen role.
3. Use light, natural fillers ("I see," "That makes sense," "Could you elaborate on that?") to seem more human.
4. If the user's response is vague, probe for more detail using the STAR (Situation, Task, Action, Result) method.
5. Never break character or reveal that you are an AI.

Remember to:
- Be encouraging and constructive
- Ask follow-up questions that help students think deeper
- Provide gentle guidance when responses lack structure
- Maintain a professional yet approachable tone
- Focus on helping students showcase their potential`;

// AI Feedback Prompt (System Prompt for OpenAI)
export const FEEDBACK_GENERATION_PROMPT = `You are an expert interview coach providing detailed feedback to university students. 

Analyze the provided interview transcript and respond ONLY with a single, minified JSON object matching this exact schema:

{
  "score": number (0-10),
  "strengths": [string, string, string],
  "improvements": [string, string, string],
  "learnings": [string, string, string]
}

Scoring criteria (0-10):
- 8-10: Exceptional responses with clear STAR structure, specific examples, strong communication
- 6-7: Good responses with some structure, relevant examples, clear communication
- 4-5: Average responses, basic examples, needs improvement in structure/clarity
- 2-3: Weak responses, vague examples, poor communication
- 0-1: Very poor responses, no clear examples, unclear communication

For each array, provide exactly 3 items:
- Strengths: Specific positive aspects of their responses
- Improvements: Constructive areas for development
- Learnings: Key takeaways and actionable insights

Do not include any explanatory text, markdown formatting, or additional content outside the JSON object.`;

// Role-specific question banks
export const INTERVIEW_QUESTIONS = {
  'software-engineer': {
    behavioral: [
      "Tell me about a challenging project you worked on and how you overcame obstacles.",
      "Describe a time when you had to work with a difficult team member.",
      "How do you prioritize tasks when working on multiple projects?",
      "Tell me about a time you made a mistake in your code. How did you handle it?",
      "Describe a situation where you had to learn a new technology quickly.",
    ],
    technical: [
      "What's the difference between a stack and a queue?",
      "How would you explain object-oriented programming to someone new to coding?",
      "What are some ways to optimize database queries?",
      "How do you approach debugging a complex issue?",
      "What's your experience with version control systems like Git?",
    ],
  },
  'product-manager': {
    behavioral: [
      "Tell me about a time you had to make a difficult product decision.",
      "Describe how you would prioritize features for a new product.",
      "How do you handle conflicting requirements from different stakeholders?",
      "Tell me about a time you had to influence others without authority.",
      "Describe your approach to gathering user feedback.",
    ],
    technical: [
      "How would you measure the success of a new feature?",
      "What frameworks do you use for product prioritization?",
      "How do you work with engineering teams to estimate effort?",
      "What's your experience with A/B testing?",
      "How do you stay updated on market trends and user needs?",
    ],
  },
  'marketing': {
    behavioral: [
      "Tell me about a successful marketing campaign you've worked on.",
      "Describe how you would approach marketing a new product to a target audience.",
      "How do you measure the effectiveness of marketing campaigns?",
      "Tell me about a time you had to work within a limited budget.",
      "Describe your experience with data analysis and reporting.",
    ],
    technical: [
      "What marketing channels have you found most effective?",
      "How do you approach customer segmentation?",
      "What's your experience with marketing automation tools?",
      "How do you optimize content for SEO?",
      "What metrics do you track for digital marketing campaigns?",
    ],
  },
  'data-scientist': {
    behavioral: [
      "Tell me about a complex data problem you solved.",
      "Describe how you communicate technical findings to non-technical stakeholders.",
      "How do you ensure the quality and accuracy of your data analysis?",
      "Tell me about a time your analysis led to important business decisions.",
      "Describe your approach to working with messy or incomplete data.",
    ],
    technical: [
      "What's the difference between supervised and unsupervised learning?",
      "How do you handle missing data in your datasets?",
      "What statistical methods do you use most frequently?",
      "How do you validate the performance of a machine learning model?",
      "What's your experience with data visualization tools?",
    ],
  },
};

// Interview templates
export const INTERVIEW_TEMPLATES = [
  {
    id: 'behavioral-junior-swe',
    title: 'Behavioral Interview for Junior Software Engineer',
    description: 'Focus on teamwork, problem-solving, and learning experiences',
    category: 'behavioral' as const,
    difficulty: 'entry' as const,
    estimatedDuration: 15,
    sampleQuestions: INTERVIEW_QUESTIONS['software-engineer'].behavioral.slice(0, 3),
  },
  {
    id: 'technical-junior-swe',
    title: 'Technical Interview for Junior Software Engineer',
    description: 'Basic programming concepts and problem-solving skills',
    category: 'technical' as const,
    difficulty: 'entry' as const,
    estimatedDuration: 15,
    sampleQuestions: INTERVIEW_QUESTIONS['software-engineer'].technical.slice(0, 3),
  },
  {
    id: 'behavioral-pm',
    title: 'Behavioral Interview for Product Manager',
    description: 'Leadership, decision-making, and stakeholder management',
    category: 'behavioral' as const,
    difficulty: 'mid' as const,
    estimatedDuration: 15,
    sampleQuestions: INTERVIEW_QUESTIONS['product-manager'].behavioral.slice(0, 3),
  },
  {
    id: 'behavioral-marketing',
    title: 'Behavioral Interview for Marketing Role',
    description: 'Creativity, campaign management, and analytical thinking',
    category: 'behavioral' as const,
    difficulty: 'entry' as const,
    estimatedDuration: 15,
    sampleQuestions: INTERVIEW_QUESTIONS['marketing'].behavioral.slice(0, 3),
  },
  {
    id: 'technical-data-scientist',
    title: 'Technical Interview for Data Scientist',
    description: 'Statistical analysis, machine learning, and data handling',
    category: 'technical' as const,
    difficulty: 'mid' as const,
    estimatedDuration: 15,
    sampleQuestions: INTERVIEW_QUESTIONS['data-scientist'].technical.slice(0, 3),
  },
];
