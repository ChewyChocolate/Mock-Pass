import type { Question } from '../../types';

const PROFESSIONAL_QUESTIONS: Question[] = [
  {
    id: 'q-001',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt:
      'Identify the grammatical error in the following sentence: "The group of researchers are exploring the uncharted territories of the archipelago."',
    options: [
      { id: 'A', text: 'The group of' },
      { id: 'B', text: 'researchers are' },
      { id: 'C', text: 'exploring the' },
      { id: 'D', text: 'uncharted territories of the archipelago' },
    ],
    correctOptionId: 'B',
    explanation:
      'The collective noun "group" is singular and requires the singular verb "is" instead of "are." This is a common subject-verb agreement error tested in the Civil Service Examination.',
  },
  {
    id: 'q-002',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Choose the sentence with the correct use of a pronoun.',
    options: [
      { id: 'A', text: 'Between you and I, the test was difficult.' },
      { id: 'B', text: 'She gave the book to John and myself.' },
      { id: 'C', text: 'The manager told Alex and me to submit the report.' },
      { id: 'D', text: 'Him and his brother went to the rally.' },
    ],
    correctOptionId: 'C',
    explanation:
      '"Me" is the objective-case pronoun and is correct as the object of the infinitive "to submit." The others misuse subjective forms (I, himself, him) where objective forms are required.',
  },
  {
    id: 'q-003',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Which sentence contains a misplaced modifier?',
    options: [
      { id: 'A', text: 'She served cake to the children on paper plates.' },
      { id: 'B', text: 'Running quickly, the bus was caught by the passenger.' },
      { id: 'C', text: 'He handed the report to the manager yesterday.' },
      { id: 'D', text: 'The teacher praised the student for her essay.' },
    ],
    correctOptionId: 'B',
    explanation:
      'The participial phrase "Running quickly" incorrectly modifies "the bus" instead of the passenger. It should read: "Running quickly, the passenger caught the bus."',
  },
  {
    id: 'q-004',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Pick the option that maintains parallel structure.',
    options: [
      { id: 'A', text: 'The job requires skill, patience, and to be thorough.' },
      { id: 'B', text: 'She likes reading, writing, and to paint.' },
      { id: 'C', text: 'He plans to study, work, and rest during the break.' },
      { id: 'D', text: 'We came, we saw, and we are conquering.' },
    ],
    correctOptionId: 'C',
    explanation:
      'Parallel structure requires the same grammatical form. Option C uses three infinitives (to study, to work, to rest) consistently.',
  },
  {
    id: 'q-005',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Choose the correctly spelled word.',
    options: [
      { id: 'A', text: 'Occurence' },
      { id: 'B', text: 'Embarrass' },
      { id: 'C', text: 'Definately' },
      { id: 'D', text: 'Recieve' },
    ],
    correctOptionId: 'B',
    explanation:
      '"Embarrass" has two r\'s and two s\'s. The correct spellings are: occurrence, definitely, and receive.',
  },
  {
    id: 'q-006',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'BOOK is to READING as FORK is to:',
    options: [
      { id: 'A', text: 'Kitchen' },
      { id: 'B', text: 'Eating' },
      { id: 'C', text: 'Spoon' },
      { id: 'D', text: 'Food' },
    ],
    correctOptionId: 'B',
    explanation:
      'A book is the instrument used for the act of reading; a fork is the instrument used for the act of eating.',
  },
  {
    id: 'q-007',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Choose the word that is most nearly opposite in meaning to BENEVOLENT.',
    options: [
      { id: 'A', text: 'Generous' },
      { id: 'B', text: 'Malevolent' },
      { id: 'C', text: 'Prudent' },
      { id: 'D', text: 'Candid' },
    ],
    correctOptionId: 'B',
    explanation:
      '"Benevolent" means well-meaning and kind. Its antonym is "malevolent," meaning wishing evil to others.',
  },
  {
    id: 'q-008',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Pick the correct sentence.',
    options: [
      { id: 'A', text: 'Its a beautiful day to study at the library.' },
      { id: 'B', text: 'It\'s a beautiful day to study at the library.' },
      { id: 'C', text: 'Its\' a beautiful day to study at the library.' },
      { id: 'D', text: 'Its a beautiful day, to study at the library.' },
    ],
    correctOptionId: 'B',
    explanation:
      '"It\'s" is the contraction of "it is." The other options misuse the possessive "its" or punctuate incorrectly.',
  },
  {
    id: 'q-009',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'DOCTOR is to HOSPITAL as TEACHER is to:',
    options: [
      { id: 'A', text: 'Book' },
      { id: 'B', text: 'Classroom' },
      { id: 'C', text: 'Student' },
      { id: 'D', text: 'Lesson' },
    ],
    correctOptionId: 'B',
    explanation:
      'A doctor works in a hospital; a teacher works in a classroom. Both are the primary workplace of the profession.',
  },
  {
    id: 'q-010',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Choose the option that best completes the sentence: "The committee was divided ___ its decision."',
    options: [
      { id: 'A', text: 'regarding' },
      { id: 'B', text: 'regarding to' },
      { id: 'C', text: 'as regarding' },
      { id: 'D', text: 'in regard with' },
    ],
    correctOptionId: 'A',
    explanation:
      '"Divided regarding" is the idiomatic prepositional phrase. "Regarding to," "as regarding," and "in regard with" are non-standard.',
  },
  {
    id: 'q-011',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Which word is closest in meaning to CANDID?',
    options: [
      { id: 'A', text: 'Secretive' },
      { id: 'B', text: 'Frank' },
      { id: 'C', text: 'Careful' },
      { id: 'D', text: 'Polite' },
    ],
    correctOptionId: 'B',
    explanation:
      '"Candid" means honest and straightforward — closest in meaning to "frank." "Secretive" is the opposite.',
  },
  {
    id: 'q-012',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Which sentence uses the semicolon correctly?',
    options: [
      { id: 'A', text: 'She brought pencils; paper, and a ruler.' },
      { id: 'B', text: 'The exam was difficult; yet most students passed.' },
      { id: 'C', text: 'He finished the test; and left the room.' },
      { id: 'D', text: 'The meeting started at 9 am; sharp.' },
    ],
    correctOptionId: 'B',
    explanation:
      'A semicolon connects two independent clauses, often with a conjunctive adverb like "yet." The other options misuse it before a list, after a conjunction, or as a pause within a clause.',
  },
  {
    id: 'q-013',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'EYE is to SEE as EAR is to:',
    options: [
      { id: 'A', text: 'Sound' },
      { id: 'B', text: 'Hear' },
      { id: 'C', text: 'Music' },
      { id: 'D', text: 'Noise' },
    ],
    correctOptionId: 'B',
    explanation:
      'The eye is the organ used for the action of seeing; the ear is the organ used for the action of hearing.',
  },
  {
    id: 'q-014',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Choose the option with the correct subject-verb agreement.',
    options: [
      { id: 'A', text: 'The list of requirements are on the desk.' },
      { id: 'B', text: 'The news from the front lines are encouraging.' },
      { id: 'C', text: 'Mathematics are a difficult subject for many students.' },
      { id: 'D', text: 'The committee has reached its decision.' },
    ],
    correctOptionId: 'D',
    explanation:
      '"Committee" is a singular collective noun and takes "has." The other options treat singular subjects (list, news, mathematics) as plural.',
  },
  {
    id: 'q-015',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Identify the correctly punctuated sentence.',
    options: [
      { id: 'A', text: 'Maria bought apples oranges and, bananas.' },
      { id: 'B', text: 'Maria bought apples, oranges, and bananas.' },
      { id: 'C', text: 'Maria bought, apples oranges and bananas.' },
      { id: 'D', text: 'Maria bought apples oranges, and bananas.' },
    ],
    correctOptionId: 'B',
    explanation:
      'Items in a series are separated by commas. The final comma before "and" (Oxford comma) is acceptable and used here for clarity.',
  },
  {
    id: 'q-016',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Choose the sentence with no errors.',
    options: [
      { id: 'A', text: 'Neither the principal nor the teachers is going to attend the rally.' },
      { id: 'B', text: 'Neither the principal nor the teachers are going to attend the rally.' },
      { id: 'C', text: 'Neither the teachers nor the principal are going to attend the rally.' },
      { id: 'D', text: 'Neither the teachers nor the principal is going to attend the rally.' },
    ],
    correctOptionId: 'D',
    explanation:
      'With "neither…nor," the verb agrees with the closer subject. "Principal" is singular, so the verb is "is."',
  },
  {
    id: 'q-017',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'PILOT is to PLANE as CAPTAIN is to:',
    options: [
      { id: 'A', text: 'Ship' },
      { id: 'B', text: 'Sea' },
      { id: 'C', text: 'Anchor' },
      { id: 'D', text: 'Sailor' },
    ],
    correctOptionId: 'A',
    explanation:
      'A pilot operates a plane; a captain commands a ship. Both are the leader of the respective vehicle.',
  },
  {
    id: 'q-018',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Pick the correct verb form: "The data from the survey ___ conclusive."',
    options: [
      { id: 'A', text: 'are' },
      { id: 'B', text: 'is' },
      { id: 'C', text: 'have been' },
      { id: 'D', text: 'were being' },
    ],
    correctOptionId: 'B',
    explanation:
      'In standard American English, "data" used as a singular mass noun takes a singular verb ("is"). In scientific writing, this is the preferred form.',
  },
  {
    id: 'q-019',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Which option best replaces the underlined phrase: "She gave a litany of complaints ___ the new policy."',
    options: [
      { id: 'A', text: 'regarding to' },
      { id: 'B', text: 'about' },
      { id: 'C', text: 'concerning about' },
      { id: 'D', text: 'with regards of' },
    ],
    correctOptionId: 'B',
    explanation:
      '"Complaints about" is the standard collocation. "Regarding" does not take "to," and "concerning about" and "with regards of" are ungrammatical.',
  },
  {
    id: 'q-020',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'The antonym of FRUGAL is:',
    options: [
      { id: 'A', text: 'Wasteful' },
      { id: 'B', text: 'Thrifty' },
      { id: 'C', text: 'Economical' },
      { id: 'D', text: 'Prudent' },
    ],
    correctOptionId: 'A',
    explanation:
      '"Frugal" means careful with money; "wasteful" spends extravagantly. The others are synonyms, not antonyms.',
  },
  {
    id: 'q-021',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Choose the sentence with the correct use of "who" or "whom."',
    options: [
      { id: 'A', text: 'Who did you invite to the meeting?' },
      { id: 'B', text: 'Whom did you invite to the meeting?' },
      { id: 'C', text: 'Who did you give the package to?' },
      { id: 'D', text: 'Whom gave you the package?' },
    ],
    correctOptionId: 'B',
    explanation:
      '"Whom" is the objective case, used as the object of the verb "invite." In A, "who" is the subject of an unstated clause. In C, the preposition "to" requires the objective "whom."',
  },
  {
    id: 'q-022',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'CLOCK is to TIME as THERMOMETER is to:',
    options: [
      { id: 'A', text: 'Heat' },
      { id: 'B', text: 'Temperature' },
      { id: 'C', text: 'Weather' },
      { id: 'D', text: 'Mercury' },
    ],
    correctOptionId: 'B',
    explanation:
      'A clock measures time; a thermometer measures temperature. Both are instruments that measure a physical quantity.',
  },
  {
    id: 'q-023',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Choose the option that best completes the analogy: PEN is to WRITER as BRUSH is to:',
    options: [
      { id: 'A', text: 'Canvas' },
      { id: 'B', text: 'Paint' },
      { id: 'C', text: 'Painter' },
      { id: 'D', text: 'Easel' },
    ],
    correctOptionId: 'C',
    explanation:
      'A pen is the tool of a writer; a brush is the tool of a painter. The pattern is tool to the user of the tool.',
  },
  {
    id: 'q-024',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Which sentence correctly uses "affect" vs. "effect"?',
    options: [
      { id: 'A', text: 'The rain had no affect on the parade.' },
      { id: 'B', text: 'The rain had no effect on the parade.' },
      { id: 'C', text: 'The rain had no effect on the parade\'s affect.' },
      { id: 'D', text: 'The rain had no affect on the parade\'s effect.' },
    ],
    correctOptionId: 'B',
    explanation:
      '"Effect" is usually a noun meaning result; "affect" is usually a verb meaning to influence. "Had no effect" is correct.',
  },
  {
    id: 'q-025',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Identify the dangling modifier: "While reading the book, the doorbell rang."',
    options: [
      { id: 'A', text: 'While reading the book' },
      { id: 'B', text: 'the doorbell' },
      { id: 'C', text: 'doorbell rang' },
      { id: 'D', text: 'the book' },
    ],
    correctOptionId: 'A',
    explanation:
      'The participial phrase "While reading the book" is meant to modify a person, but the main subject is "the doorbell." It should read: "While I was reading the book, the doorbell rang."',
  },
  {
    id: 'q-026',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'The phrase "to kick the bucket" is an example of:',
    options: [
      { id: 'A', text: 'Simile' },
      { id: 'B', text: 'Metaphor' },
      { id: 'C', text: 'Idiom' },
      { id: 'D', text: 'Hyperbole' },
    ],
    correctOptionId: 'C',
    explanation:
      'An idiom is a phrase whose meaning is not deducible from the literal meanings of its words. "Kick the bucket" means to die.',
  },
  {
    id: 'q-027',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Which sentence contains a comma splice?',
    options: [
      { id: 'A', text: 'I went to the store, and I bought milk.' },
      { id: 'B', text: 'I went to the store, I bought milk.' },
      { id: 'C', text: 'I went to the store; I bought milk.' },
      { id: 'D', text: 'After I went to the store, I bought milk.' },
    ],
    correctOptionId: 'B',
    explanation:
      'A comma splice joins two independent clauses with only a comma. It is fixed by using a semicolon, period, or conjunction.',
  },
  {
    id: 'q-028',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Choose the sentence with the correct comparative form.',
    options: [
      { id: 'A', text: 'Of the two options, B is more better.' },
      { id: 'B', text: 'Of the two options, B is better.' },
      { id: 'C', text: 'Of the two options, B is best.' },
      { id: 'D', text: 'Of the two options, B is most best.' },
    ],
    correctOptionId: 'B',
    explanation:
      'With two items, use the comparative "better," not "more better" or the superlative "best." "Most best" is a double superlative.',
  },
  {
    id: 'q-029',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'The word LOQUACIOUS means:',
    options: [
      { id: 'A', text: 'Silent' },
      { id: 'B', text: 'Talkative' },
      { id: 'C', text: 'Angry' },
      { id: 'D', text: 'Shy' },
    ],
    correctOptionId: 'B',
    explanation:
      '"Loquacious" comes from Latin "loqui" (to speak) and means very talkative.',
  },
  {
    id: 'q-030',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Choose the sentence that correctly uses the past tense.',
    options: [
      { id: 'A', text: 'I have went to the market yesterday.' },
      { id: 'B', text: 'I had went to the market yesterday.' },
      { id: 'C', text: 'I went to the market yesterday.' },
      { id: 'D', text: 'I have gone to the market yesterday.' },
    ],
    correctOptionId: 'C',
    explanation:
      'With the specific past-time marker "yesterday," use the simple past "went." "Have went" and "had went" misuse the past participle; "have gone yesterday" is also wrong.',
  },
  {
    id: 'q-031',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'WHALE is to OCEAN as CAMEL is to:',
    options: [
      { id: 'A', text: 'Water' },
      { id: 'B', text: 'Desert' },
      { id: 'C', text: 'Sand' },
      { id: 'D', text: 'Mountain' },
    ],
    correctOptionId: 'B',
    explanation:
      'A whale lives in the ocean; a camel lives in the desert. Both are animals strongly associated with a habitat.',
  },
  {
    id: 'q-032',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Pick the correct plural form of "analysis."',
    options: [
      { id: 'A', text: 'Analysises' },
      { id: 'B', text: 'Analyses' },
      { id: 'C', text: 'Analysis' },
      { id: 'D', text: 'Analysi' },
    ],
    correctOptionId: 'B',
    explanation:
      '"Analysis" is a Greek-origin noun whose plural is "analyses" (pronounced a-NAL-uh-seez).',
  },
  {
    id: 'q-033',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Which sentence correctly uses an apostrophe?',
    options: [
      { id: 'A', text: 'The dog wagged it\'s tail.' },
      { id: 'B', text: 'The dog wagged its tail.' },
      { id: 'C', text: 'The dog wagged its\' tail.' },
      { id: 'D', text: 'The dog wagged it\'s\' tail.' },
    ],
    correctOptionId: 'B',
    explanation:
      '"Its" is the possessive form of "it." "It\'s" means "it is." Apostrophes are not used to form plurals or possessives of pronouns.',
  },
  {
    id: 'q-034',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Identify the type of error: "Me and him went to the store."',
    options: [
      { id: 'A', text: 'Spelling' },
      { id: 'B', text: 'Pronoun case' },
      { id: 'C', text: 'Verb tense' },
      { id: 'D', text: 'Subject-verb agreement' },
    ],
    correctOptionId: 'B',
    explanation:
      'The subjective case "He and I" should be used as the subject of the sentence. "Me" and "him" are objective-case pronouns.',
  },
  {
    id: 'q-035',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Which word is a synonym of DILIGENT?',
    options: [
      { id: 'A', text: 'Lazy' },
      { id: 'B', text: 'Hardworking' },
      { id: 'C', text: 'Clever' },
      { id: 'D', text: 'Honest' },
    ],
    correctOptionId: 'B',
    explanation:
      '"Diligent" means showing care and effort in one\'s work — synonymous with "hardworking." "Lazy" is the opposite.',
  },
  {
    id: 'q-036',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Choose the correctly capitalized option.',
    options: [
      { id: 'A', text: 'My uncle lives in the South of France.' },
      { id: 'B', text: 'My Uncle lives in the south of France.' },
      { id: 'C', text: 'My uncle lives in the South of France.' },
      { id: 'D', text: 'my Uncle lives in the south of France.' },
    ],
    correctOptionId: 'A',
    explanation:
      'A kinship title is not capitalized when used with a possessive or as a common noun ("my uncle"). The "South" of a country is a proper noun and capitalized.',
  },
  {
    id: 'q-037',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'KEY is to LOCK as PASSWORD is to:',
    options: [
      { id: 'A', text: 'Account' },
      { id: 'B', text: 'Computer' },
      { id: 'C', text: 'Hacker' },
      { id: 'D', text: 'Login' },
    ],
    correctOptionId: 'A',
    explanation:
      'A key opens a lock; a password opens (provides access to) an account. The pattern is the credential that grants access to a protected thing.',
  },
  {
    id: 'q-038',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Choose the best replacement for the underlined word: "The mayor gave a very unique proposal."',
    options: [
      { id: 'A', text: 'Leave as is' },
      { id: 'B', text: 'Replace "very" with "quite"' },
      { id: 'C', text: 'Remove "very" because "unique" is absolute' },
      { id: 'D', text: 'Replace "unique" with "interesting"' },
    ],
    correctOptionId: 'C',
    explanation:
      '"Unique" is an absolute adjective — something is either unique or it is not. Words like "very" or "quite" cannot modify absolute adjectives.',
  },
  {
    id: 'q-039',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Which sentence uses a colon correctly?',
    options: [
      { id: 'A', text: 'I need the following items: a pen, paper, and an eraser.' },
      { id: 'B', text: 'I need: a pen, paper, and an eraser.' },
      { id: 'C', text: 'I need a pen, paper, and: an eraser.' },
      { id: 'D', text: 'I need: a pen paper and an eraser.' },
    ],
    correctOptionId: 'A',
    explanation:
      'A colon follows an independent clause and introduces a list, explanation, or quotation. It should not split a verb from its objects.',
  },
  {
    id: 'q-040',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'ANTONYM of OPTIMIST is:',
    options: [
      { id: 'A', text: 'Realist' },
      { id: 'B', text: 'Pessimist' },
      { id: 'C', text: 'Idealist' },
      { id: 'D', text: 'Agnostic' },
    ],
    correctOptionId: 'B',
    explanation:
      'An "optimist" expects the best; a "pessimist" expects the worst. They are opposites in outlook.',
  },
  {
    id: 'q-041',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Choose the sentence that uses active voice correctly.',
    options: [
      { id: 'A', text: 'The cake was eaten by the children.' },
      { id: 'B', text: 'The children ate the cake.' },
      { id: 'C', text: 'The cake was ate by the children.' },
      { id: 'D', text: 'The eating of the cake was done by children.' },
    ],
    correctOptionId: 'B',
    explanation:
      'Active voice: subject performs the action. "The children ate the cake" is concise and direct.',
  },
  {
    id: 'q-042',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'SCISSORS is to CUT as NEEDLE is to:',
    options: [
      { id: 'A', text: 'Thread' },
      { id: 'B', text: 'Sew' },
      { id: 'C', text: 'Fabric' },
      { id: 'D', text: 'Pin' },
    ],
    correctOptionId: 'B',
    explanation:
      'Scissors are used to cut; a needle is used to sew. The pattern is tool to the primary action performed with it.',
  },
  {
    id: 'q-043',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'The word LACONIC means:',
    options: [
      { id: 'A', text: 'Wordy' },
      { id: 'B', text: 'Using very few words' },
      { id: 'C', text: 'Speaking in rhymes' },
      { id: 'D', text: 'Loud' },
    ],
    correctOptionId: 'B',
    explanation:
      '"Laconic" means using very few words; concise to the point of seeming rude. The word comes from Laconia, whose Spartans were famously terse.',
  },
  {
    id: 'q-044',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'Identify the sentence fragment.',
    options: [
      { id: 'A', text: 'She finished her work on time.' },
      { id: 'B', text: 'Running through the park on a sunny morning.' },
      { id: 'C', text: 'He reads novels before bed.' },
      { id: 'D', text: 'The team won the championship.' },
    ],
    correctOptionId: 'B',
    explanation:
      '"Running through the park on a sunny morning" lacks a subject and verb — it is a phrase, not a complete sentence.',
  },
  {
    id: 'q-045',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: 'The phrase "to bite the bullet" means:',
    options: [
      { id: 'A', text: 'To eat something hard' },
      { id: 'B', text: 'To face an unpleasant situation bravely' },
      { id: 'C', text: 'To make a mistake' },
      { id: 'D', text: 'To act quickly' },
    ],
    correctOptionId: 'B',
    explanation:
      '"Bite the bullet" is an idiom meaning to face a painful or difficult situation with courage.',
  },
  {
    id: 'q-046',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt:
      'If a person can complete a task in 8 hours, how long will it take for three people working at the same rate to finish the task?',
    options: [
      { id: 'A', text: '24 hours' },
      { id: 'B', text: '2 hours and 40 minutes' },
      { id: 'C', text: '4 hours' },
      { id: 'D', text: '3 hours' },
    ],
    correctOptionId: 'B',
    explanation:
      'Inverse variation: 8 hours / 3 workers ≈ 2.66 hours = 2 hours and 40 minutes.',
  },
  {
    id: 'q-047',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'What is 15% of 240?',
    options: [
      { id: 'A', text: '32' },
      { id: 'B', text: '36' },
      { id: 'C', text: '40' },
      { id: 'D', text: '42' },
    ],
    correctOptionId: 'B',
    explanation: '15% × 240 = 0.15 × 240 = 36.',
  },
  {
    id: 'q-048',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt:
      'If the ratio of boys to girls in a class is 3:5 and there are 24 boys, how many girls are there?',
    options: [
      { id: 'A', text: '30' },
      { id: 'B', text: '36' },
      { id: 'C', text: '40' },
      { id: 'D', text: '48' },
    ],
    correctOptionId: 'C',
    explanation: '3:5 = 24:x. So x = (5 × 24) / 3 = 40.',
  },
  {
    id: 'q-049',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt:
      'The average of five numbers is 18. If one number is removed, the average becomes 16. What number was removed?',
    options: [
      { id: 'A', text: '22' },
      { id: 'B', text: '24' },
      { id: 'C', text: '26' },
      { id: 'D', text: '28' },
    ],
    correctOptionId: 'C',
    explanation:
      'Sum of five numbers = 5 × 18 = 90. Sum of four numbers = 4 × 16 = 64. Removed number = 90 − 64 = 26.',
  },
  {
    id: 'q-050',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'A shirt originally priced at ₱1,200 is on sale at 25% off. What is the sale price?',
    options: [
      { id: 'A', text: '₱800' },
      { id: 'B', text: '₱850' },
      { id: 'C', text: '₱900' },
      { id: 'D', text: '₱950' },
    ],
    correctOptionId: 'C',
    explanation: '25% of 1,200 = 300. Sale price = 1,200 − 300 = ₱900.',
  },
  {
    id: 'q-051',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'Simple interest on ₱5,000 at 6% per year for 3 years is:',
    options: [
      { id: 'A', text: '₱600' },
      { id: 'B', text: '₱800' },
      { id: 'C', text: '₱900' },
      { id: 'D', text: '₱1,000' },
    ],
    correctOptionId: 'C',
    explanation: 'I = P × r × t = 5,000 × 0.06 × 3 = ₱900.',
  },
  {
    id: 'q-052',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'If 3/4 of a number is 36, what is 5/6 of the number?',
    options: [
      { id: 'A', text: '30' },
      { id: 'B', text: '36' },
      { id: 'C', text: '40' },
      { id: 'D', text: '48' },
    ],
    correctOptionId: 'C',
    explanation:
      'Number = 36 ÷ 3/4 = 36 × 4/3 = 48. Then 5/6 × 48 = 40.',
  },
  {
    id: 'q-053',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'A car travels 60 km per hour. How many meters does it travel in 15 seconds?',
    options: [
      { id: 'A', text: '150 m' },
      { id: 'B', text: '200 m' },
      { id: 'C', text: '250 m' },
      { id: 'D', text: '300 m' },
    ],
    correctOptionId: 'C',
    explanation:
      '60 km/h = 60,000 m / 3,600 s = 16.67 m/s. In 15 s: 16.67 × 15 = 250 m.',
  },
  {
    id: 'q-054',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'What is 35% of 80?',
    options: [
      { id: 'A', text: '24' },
      { id: 'B', text: '26' },
      { id: 'C', text: '28' },
      { id: 'D', text: '30' },
    ],
    correctOptionId: 'C',
    explanation: '0.35 × 80 = 28.',
  },
  {
    id: 'q-055',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'A rectangular garden is 12 m long and 8 m wide. What is its area in square meters?',
    options: [
      { id: 'A', text: '40' },
      { id: 'B', text: '80' },
      { id: 'C', text: '96' },
      { id: 'D', text: '120' },
    ],
    correctOptionId: 'C',
    explanation: 'Area = length × width = 12 × 8 = 96 m².',
  },
  {
    id: 'q-056',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'A sum of money doubles itself in 8 years at simple interest. What is the rate?',
    options: [
      { id: 'A', text: '8%' },
      { id: 'B', text: '10%' },
      { id: 'C', text: '12.5%' },
      { id: 'D', text: '15%' },
    ],
    correctOptionId: 'C',
    explanation:
      'For doubling, the interest equals the principal: P × r × 8 = P. So r = 1/8 = 0.125 = 12.5%.',
  },
  {
    id: 'q-057',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'If x + 5 = 12, what is 3x?',
    options: [
      { id: 'A', text: '7' },
      { id: 'B', text: '14' },
      { id: 'C', text: '21' },
      { id: 'D', text: '28' },
    ],
    correctOptionId: 'C',
    explanation: 'x = 7. Then 3x = 21.',
  },
  {
    id: 'q-058',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'A train running at 90 km/h passes a pole in 12 seconds. What is the length of the train?',
    options: [
      { id: 'A', text: '200 m' },
      { id: 'B', text: '250 m' },
      { id: 'C', text: '300 m' },
      { id: 'D', text: '350 m' },
    ],
    correctOptionId: 'C',
    explanation:
      '90 km/h = 25 m/s. Length = 25 × 12 = 300 m.',
  },
  {
    id: 'q-059',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'What is the next number in the series: 1, 4, 9, 16, __?',
    options: [
      { id: 'A', text: '20' },
      { id: 'B', text: '25' },
      { id: 'C', text: '30' },
      { id: 'D', text: '36' },
    ],
    correctOptionId: 'B',
    explanation: 'These are perfect squares: 1², 2², 3², 4², 5² = 25.',
  },
  {
    id: 'q-060',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'A vendor bought 50 mangoes for ₱500. At what price must he sell each mango to earn a 20% profit?',
    options: [
      { id: 'A', text: '₱10' },
      { id: 'B', text: '₱12' },
      { id: 'C', text: '₱15' },
      { id: 'D', text: '₱18' },
    ],
    correctOptionId: 'B',
    explanation:
      'Cost per mango = 500 / 50 = ₱10. With 20% profit: 10 × 1.20 = ₱12.',
  },
  {
    id: 'q-061',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'The perimeter of a square is 48 cm. What is its area?',
    options: [
      { id: 'A', text: '100 cm²' },
      { id: 'B', text: '121 cm²' },
      { id: 'C', text: '144 cm²' },
      { id: 'D', text: '169 cm²' },
    ],
    correctOptionId: 'C',
    explanation: 'Side = 48 / 4 = 12 cm. Area = 12² = 144 cm².',
  },
  {
    id: 'q-062',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'If 5 workers can paint 10 houses in 6 days, how many days will 3 workers need to paint the same 10 houses?',
    options: [
      { id: 'A', text: '6 days' },
      { id: 'B', text: '8 days' },
      { id: 'C', text: '10 days' },
      { id: 'D', text: '12 days' },
    ],
    correctOptionId: 'C',
    explanation:
      'Worker-days required = 5 × 6 = 30. With 3 workers: 30 / 3 = 10 days.',
  },
  {
    id: 'q-063',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'What is 1/4 + 1/3 + 1/6?',
    options: [
      { id: 'A', text: '1/2' },
      { id: 'B', text: '3/4' },
      { id: 'C', text: '5/6' },
      { id: 'D', text: '7/12' },
    ],
    correctOptionId: 'B',
    explanation:
      'Common denominator 12: 3/12 + 4/12 + 2/12 = 9/12 = 3/4.',
  },
  {
    id: 'q-064',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'A person saves 15% of his monthly salary. If he earns ₱30,000, how much does he save?',
    options: [
      { id: 'A', text: '₱3,000' },
      { id: 'B', text: '₱4,500' },
      { id: 'C', text: '₱5,000' },
      { id: 'D', text: '₱6,000' },
    ],
    correctOptionId: 'B',
    explanation: '0.15 × 30,000 = ₱4,500.',
  },
  {
    id: 'q-065',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'A boat goes 30 km upstream in 5 hours and 30 km downstream in 3 hours. What is the speed of the current?',
    options: [
      { id: 'A', text: '0.5 km/h' },
      { id: 'B', text: '1 km/h' },
      { id: 'C', text: '1.5 km/h' },
      { id: 'D', text: '2 km/h' },
    ],
    correctOptionId: 'B',
    explanation:
      'Upstream speed = 6 km/h. Downstream speed = 10 km/h. Current = (10 − 6) / 2 = 2 / 2 = 1 km/h.',
  },
  {
    id: 'q-066',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'If a:b = 2:3 and b:c = 4:5, what is a:c?',
    options: [
      { id: 'A', text: '2:5' },
      { id: 'B', text: '5:8' },
      { id: 'C', text: '8:15' },
      { id: 'D', text: '4:5' },
    ],
    correctOptionId: 'C',
    explanation:
      'a:b = 2:3 = 8:12. b:c = 4:5 = 12:15. So a:c = 8:15.',
  },
  {
    id: 'q-067',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'A clock shows 3:15. What is the angle between the hour and minute hands?',
    options: [
      { id: 'A', text: '0°' },
      { id: 'B', text: '7.5°' },
      { id: 'C', text: '15°' },
      { id: 'D', text: '22.5°' },
    ],
    correctOptionId: 'B',
    explanation:
      'At 3:15, the minute hand is at 90°. The hour hand is at 90° + 15 × 0.5° = 97.5°. Difference = 7.5°.',
  },
  {
    id: 'q-068',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'Compound interest on ₱10,000 at 10% per year for 2 years compounded annually is:',
    options: [
      { id: 'A', text: '₱1,000' },
      { id: 'B', text: '₱2,000' },
      { id: 'C', text: '₱2,100' },
      { id: 'D', text: '₱2,200' },
    ],
    correctOptionId: 'C',
    explanation:
      'A = 10,000 × (1.10)² = 10,000 × 1.21 = 12,100. Interest = 2,100.',
  },
  {
    id: 'q-069',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'A map has a scale of 1:50,000. If two cities are 8 cm apart on the map, what is the actual distance in km?',
    options: [
      { id: 'A', text: '2 km' },
      { id: 'B', text: '3 km' },
      { id: 'C', text: '4 km' },
      { id: 'D', text: '5 km' },
    ],
    correctOptionId: 'C',
    explanation: '8 cm × 50,000 = 400,000 cm = 4 km.',
  },
  {
    id: 'q-070',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'If 2x + 3 = 11, what is the value of x²?',
    options: [
      { id: 'A', text: '9' },
      { id: 'B', text: '12' },
      { id: 'C', text: '16' },
      { id: 'D', text: '25' },
    ],
    correctOptionId: 'C',
    explanation: '2x = 8, so x = 4. Then x² = 16.',
  },
  {
    id: 'q-071',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'A mixture of 40 liters of milk and water contains 80% milk. How much water must be added to make milk 50%?',
    options: [
      { id: 'A', text: '20 liters' },
      { id: 'B', text: '24 liters' },
      { id: 'C', text: '32 liters' },
      { id: 'D', text: '40 liters' },
    ],
    correctOptionId: 'B',
    explanation:
      'Milk in mixture = 40 × 0.80 = 32 liters. To make milk 50% of the total: 32 = 0.5 × (40 + w). So 64 = 40 + w, w = 24 liters.',
  },
  {
    id: 'q-072',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'The ages of Ana and Ben sum to 35. In 5 years, Ana will be twice as old as Ben. How old is Ana now?',
    options: [
      { id: 'A', text: '20' },
      { id: 'B', text: '25' },
      { id: 'C', text: '30' },
      { id: 'D', text: '15' },
    ],
    correctOptionId: 'B',
    explanation:
      'Let a + b = 35 and (a + 5) = 2(b + 5). From the second: a = 2b + 5. Substituting: 2b + 5 + b = 35, so b = 10 and a = 25.',
  },
  {
    id: 'q-073',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'What is the smallest number that is divisible by 2, 3, 4, and 5?',
    options: [
      { id: 'A', text: '30' },
      { id: 'B', text: '45' },
      { id: 'C', text: '60' },
      { id: 'D', text: '120' },
    ],
    correctOptionId: 'C',
    explanation:
      'LCM(2,3,4,5) = 60.',
  },
  {
    id: 'q-074',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'A cube has a volume of 64 cm³. What is the length of each side?',
    options: [
      { id: 'A', text: '2 cm' },
      { id: 'B', text: '4 cm' },
      { id: 'C', text: '6 cm' },
      { id: 'D', text: '8 cm' },
    ],
    correctOptionId: 'B',
    explanation: 'Side = ∛64 = 4 cm.',
  },
  {
    id: 'q-075',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'If a dozen eggs cost ₱90, how much will 8 eggs cost?',
    options: [
      { id: 'A', text: '₱50' },
      { id: 'B', text: '₱60' },
      { id: 'C', text: '₱70' },
      { id: 'D', text: '₱75' },
    ],
    correctOptionId: 'B',
    explanation: 'Cost per egg = 90 / 12 = ₱7.50. 8 eggs = 8 × 7.50 = ₱60.',
  },
  {
    id: 'q-076',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'How many ways can 5 people sit in a row?',
    options: [
      { id: 'A', text: '25' },
      { id: 'B', text: '60' },
      { id: 'C', text: '100' },
      { id: 'D', text: '120' },
    ],
    correctOptionId: 'D',
    explanation: '5! = 5 × 4 × 3 × 2 × 1 = 120.',
  },
  {
    id: 'q-077',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'A book is sold for ₱480 at a 20% loss. What was its original price?',
    options: [
      { id: 'A', text: '₱500' },
      { id: 'B', text: '₱540' },
      { id: 'C', text: '₱600' },
      { id: 'D', text: '₱720' },
    ],
    correctOptionId: 'C',
    explanation:
      'Selling price = Cost × (1 − 0.20) = 0.80 × Cost. So Cost = 480 / 0.80 = ₱600.',
  },
  {
    id: 'q-078',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'What is the value of (3² + 4²)?',
    options: [
      { id: 'A', text: '12' },
      { id: 'B', text: '14' },
      { id: 'C', text: '25' },
      { id: 'D', text: '49' },
    ],
    correctOptionId: 'C',
    explanation: '9 + 16 = 25.',
  },
  {
    id: 'q-079',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'A class of 40 students took an exam. 60% passed. How many failed?',
    options: [
      { id: 'A', text: '12' },
      { id: 'B', text: '14' },
      { id: 'C', text: '16' },
      { id: 'D', text: '20' },
    ],
    correctOptionId: 'C',
    explanation:
      '60% of 40 = 24 passed. Failed = 40 − 24 = 16.',
  },
  {
    id: 'q-080',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'How many seconds are there in 2 hours and 15 minutes?',
    options: [
      { id: 'A', text: '7,500' },
      { id: 'B', text: '8,100' },
      { id: 'C', text: '8,500' },
      { id: 'D', text: '9,000' },
    ],
    correctOptionId: 'B',
    explanation: '2 × 3600 + 15 × 60 = 7200 + 900 = 8,100 seconds.',
  },
  {
    id: 'q-081',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'The average of 10, 20, 30, 40, and 50 is:',
    options: [
      { id: 'A', text: '25' },
      { id: 'B', text: '30' },
      { id: 'C', text: '35' },
      { id: 'D', text: '40' },
    ],
    correctOptionId: 'B',
    explanation: 'Sum = 150. Average = 150 / 5 = 30.',
  },
  {
    id: 'q-082',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'If 7x − 3 = 18, what is x?',
    options: [
      { id: 'A', text: '2' },
      { id: 'B', text: '3' },
      { id: 'C', text: '4' },
      { id: 'D', text: '5' },
    ],
    correctOptionId: 'B',
    explanation: '7x = 21, so x = 3.',
  },
  {
    id: 'q-083',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'How many degrees does the minute hand of a clock turn in 20 minutes?',
    options: [
      { id: 'A', text: '60°' },
      { id: 'B', text: '90°' },
      { id: 'C', text: '120°' },
      { id: 'D', text: '150°' },
    ],
    correctOptionId: 'C',
    explanation: 'The minute hand turns 360° in 60 minutes, so 6°/min. 20 × 6° = 120°.',
  },
  {
    id: 'q-084',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'A cylindrical can has a radius of 7 cm and a height of 10 cm. What is its volume? (Use π = 22/7)',
    options: [
      { id: 'A', text: '1,440 cm³' },
      { id: 'B', text: '1,540 cm³' },
      { id: 'C', text: '1,640 cm³' },
      { id: 'D', text: '1,740 cm³' },
    ],
    correctOptionId: 'B',
    explanation: 'V = πr²h = (22/7) × 49 × 10 = 22 × 70 = 1,540 cm³.',
  },
  {
    id: 'q-085',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'What is the least common multiple (LCM) of 8 and 12?',
    options: [
      { id: 'A', text: '16' },
      { id: 'B', text: '20' },
      { id: 'C', text: '24' },
      { id: 'D', text: '48' },
    ],
    correctOptionId: 'C',
    explanation: '8 = 2³, 12 = 2² × 3. LCM = 2³ × 3 = 24.',
  },
  {
    id: 'q-086',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'A taxi charges ₱40 as a flag-down rate plus ₱15 per km. How much will a 12-km ride cost?',
    options: [
      { id: 'A', text: '₱180' },
      { id: 'B', text: '₱200' },
      { id: 'C', text: '₱220' },
      { id: 'D', text: '₱240' },
    ],
    correctOptionId: 'C',
    explanation: '40 + 15 × 12 = 40 + 180 = ₱220.',
  },
  {
    id: 'q-087',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'If 6 men can dig a trench in 12 days, how long will 9 men need?',
    options: [
      { id: 'A', text: '6 days' },
      { id: 'B', text: '8 days' },
      { id: 'C', text: '10 days' },
      { id: 'D', text: '18 days' },
    ],
    correctOptionId: 'B',
    explanation:
      'Worker-days = 6 × 12 = 72. With 9 workers: 72 / 9 = 8 days.',
  },
  {
    id: 'q-088',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'The probability of getting heads in a single coin toss is:',
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '1/4' },
      { id: 'C', text: '1/2' },
      { id: 'D', text: '1' },
    ],
    correctOptionId: 'C',
    explanation: 'A fair coin has two equally likely outcomes; the probability of heads is 1/2.',
  },
  {
    id: 'q-089',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'Convert 0.75 to a fraction in lowest terms.',
    options: [
      { id: 'A', text: '3/5' },
      { id: 'B', text: '5/7' },
      { id: 'C', text: '3/4' },
      { id: 'D', text: '7/9' },
    ],
    correctOptionId: 'C',
    explanation: '0.75 = 75/100 = 3/4.',
  },
  {
    id: 'q-090',
    level: 'professional',
    topic: 'Numerical Ability',
    prompt: 'A man invested ₱5,000 at 8% simple interest. After how many years will the interest reach ₱2,000?',
    options: [
      { id: 'A', text: '3 years' },
      { id: 'B', text: '4 years' },
      { id: 'C', text: '5 years' },
      { id: 'D', text: '6 years' },
    ],
    correctOptionId: 'C',
    explanation: 'I = P × r × t → 2000 = 5000 × 0.08 × t → t = 5 years.',
  },
  {
    id: 'q-091',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt: 'Find the next number in the series: 2, 6, 12, 20, 30, __',
    options: [
      { id: 'A', text: '36' },
      { id: 'B', text: '40' },
      { id: 'C', text: '42' },
      { id: 'D', text: '48' },
    ],
    correctOptionId: 'C',
    explanation:
      'Differences are 4, 6, 8, 10, 12. The next difference is 12, so 30 + 12 = 42. (These are n(n+1).)',
  },
  {
    id: 'q-092',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'All roses are flowers. Some flowers fade quickly. Therefore:',
    options: [
      { id: 'A', text: 'All roses fade quickly.' },
      { id: 'B', text: 'Some roses may fade quickly.' },
      { id: 'C', text: 'No roses fade quickly.' },
      { id: 'D', text: 'All flowers are roses.' },
    ],
    correctOptionId: 'B',
    explanation:
      'Since some flowers fade quickly and roses are a subset of flowers, it is only valid to say that some roses may fade quickly.',
  },
  {
    id: 'q-093',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies. This statement is:',
    options: [
      { id: 'A', text: 'True' },
      { id: 'B', text: 'False' },
      { id: 'C', text: 'Uncertain' },
      { id: 'D', text: 'Contradictory' },
    ],
    correctOptionId: 'A',
    explanation:
      'This is the transitive property of sets: if A ⊆ B and B ⊆ C, then A ⊆ C.',
  },
  {
    id: 'q-094',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt: 'If FRIEND is coded as GSJFOE, then SHADE is coded as:',
    options: [
      { id: 'A', text: 'TIBEF' },
      { id: 'B', text: 'TBIEF' },
      { id: 'C', text: 'TBHEF' },
      { id: 'D', text: 'TIBFE' },
    ],
    correctOptionId: 'A',
    explanation:
      'Each letter is shifted forward by one: F→G, R→S, I→J, E→F, N→O, D→E. Applying the same to SHADE: S→T, H→I, A→B, D→E, E→F.',
  },
  {
    id: 'q-095',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'If the day before yesterday was Thursday, what day will it be the day after tomorrow?',
    options: [
      { id: 'A', text: 'Friday' },
      { id: 'B', text: 'Saturday' },
      { id: 'C', text: 'Sunday' },
      { id: 'D', text: 'Monday' },
    ],
    correctOptionId: 'D',
    explanation:
      'Day before yesterday was Thursday, so today is Saturday. The day after tomorrow is Monday.',
  },
  {
    id: 'q-096',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt: 'What is the next letter in the series: A, C, F, J, O, __?',
    options: [
      { id: 'A', text: 'S' },
      { id: 'B', text: 'T' },
      { id: 'C', text: 'U' },
      { id: 'D', text: 'V' },
    ],
    correctOptionId: 'C',
    explanation:
      'Gaps are 2, 3, 4, 5, 6. After O (15) + 6 = U (21).',
  },
  {
    id: 'q-097',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'If CLOUD is coded as DMPVE, then STORM is coded as:',
    options: [
      { id: 'A', text: 'TUPSN' },
      { id: 'B', text: 'TUPRA' },
      { id: 'C', text: 'TUPSO' },
      { id: 'D', text: 'TUPRO' },
    ],
    correctOptionId: 'A',
    explanation:
      'Each letter is shifted +1: C→D, L→M, O→P, U→V, D→E. So S→T, T→U, O→P, R→S, M→N = TUPSN.',
  },
  {
    id: 'q-098',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'In a family of 6 members, there are 3 boys and 3 girls. Two of the boys are taller than all the girls. How many boys are shorter than at least one girl?',
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '1' },
      { id: 'C', text: '2' },
      { id: 'D', text: '3' },
    ],
    correctOptionId: 'B',
    explanation:
      'If 2 boys are taller than all the girls, those 2 are not shorter than any girl. The remaining 1 boy is shorter than at least one girl.',
  },
  {
    id: 'q-099',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'Pointing to a man, Maria said, "He is the son of my mother\'s only son." How is the man related to Maria?',
    options: [
      { id: 'A', text: 'Nephew' },
      { id: 'B', text: 'Brother' },
      { id: 'C', text: 'Cousin' },
      { id: 'D', text: 'Uncle' },
    ],
    correctOptionId: 'B',
    explanation:
      'Maria\'s mother\'s only son is Maria\'s brother. So the man is Maria\'s brother (or herself if she has no brother).',
  },
  {
    id: 'q-100',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'Five students — A, B, C, D, E — take an exam. A scores higher than B. C scores higher than D but lower than B. E is not the lowest. Who is the highest scorer?',
    options: [
      { id: 'A', text: 'A' },
      { id: 'B', text: 'B' },
      { id: 'C', text: 'C' },
      { id: 'D', text: 'E' },
    ],
    correctOptionId: 'A',
    explanation:
      'A > B, and C < B, so A is above B which is above C which is above D. E is not the lowest, so E > D. The highest is A.',
  },
  {
    id: 'q-101',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'Which number is missing in the series: 3, 6, 11, 18, 27, __, 51?',
    options: [
      { id: 'A', text: '34' },
      { id: 'B', text: '36' },
      { id: 'C', text: '38' },
      { id: 'D', text: '40' },
    ],
    correctOptionId: 'C',
    explanation:
      'Differences: 3, 5, 7, 9, 11, 13. After 27, the next is 27 + 11 = 38.',
  },
  {
    id: 'q-102',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'In a certain code, TRAIN is written as UQBHO. How is PLANE written in that code?',
    options: [
      { id: 'A', text: 'QKZMF' },
      { id: 'B', text: 'QKZMD' },
      { id: 'C', text: 'QKCMF' },
      { id: 'D', text: 'QKBMD' },
    ],
    correctOptionId: 'A',
    explanation:
      'Each letter alternates +1 and −1 by position: T+1=U, R−1=Q, A+1=B, I−1=H, N+1=O. Applying the same pattern to PLANE: P+1=Q, L−1=K, A+1=B, N−1=M, E+1=F = QKZMF.',
  },
  {
    id: 'q-103',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt: 'Find the odd one out.',
    options: [
      { id: 'A', text: 'Triangle' },
      { id: 'B', text: 'Square' },
      { id: 'C', text: 'Pentagon' },
      { id: 'D', text: 'Circle' },
    ],
    correctOptionId: 'D',
    explanation:
      'Triangle, square, and pentagon are polygons with straight sides. A circle is a curved shape, not a polygon.',
  },
  {
    id: 'q-104',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'Six people sit around a circular table. A is opposite to B. C sits between A and D. Who sits to the immediate right of A?',
    options: [
      { id: 'A', text: 'B' },
      { id: 'B', text: 'C' },
      { id: 'C', text: 'D' },
      { id: 'D', text: 'E or F' },
    ],
    correctOptionId: 'B',
    explanation:
      'C sits between A and D, so C is adjacent to A on one side. Therefore C is to the immediate right (or left) of A.',
  },
  {
    id: 'q-105',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'If P means "+", Q means "−", R means "×", and S means "÷", then 12 R 3 P 4 Q 2 = ?',
    options: [
      { id: 'A', text: '38' },
      { id: 'B', text: '40' },
      { id: 'C', text: '42' },
      { id: 'D', text: '44' },
    ],
    correctOptionId: 'A',
    explanation:
      'Substituting operators: 12 × 3 + 4 − 2. Evaluated left to right: 12 × 3 = 36; 36 + 4 = 40; 40 − 2 = 38.',
  },
  {
    id: 'q-106',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'Statement: "All lawyers are professionals." Conclusion: "Some professionals are lawyers." Is the conclusion valid?',
    options: [
      { id: 'A', text: 'Yes, it follows logically.' },
      { id: 'B', text: 'No, it does not follow.' },
      { id: 'C', text: 'Cannot be determined.' },
      { id: 'D', text: 'Only if there is at least one lawyer.' },
    ],
    correctOptionId: 'A',
    explanation:
      'If all lawyers are professionals, then there exists at least one lawyer (in standard syllogistic contexts), so some professionals are lawyers.',
  },
  {
    id: 'q-107',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt: 'Complete the analogy: LIGHT is to DARK as HOT is to:',
    options: [
      { id: 'A', text: 'WARM' },
      { id: 'B', text: 'COLD' },
      { id: 'C', text: 'FIRE' },
      { id: 'D', text: 'SUN' },
    ],
    correctOptionId: 'B',
    explanation:
      'Light is the opposite of dark; hot is the opposite of cold.',
  },
  {
    id: 'q-108',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt: 'What comes next in the pattern: Z, Y, X, W, V, __?',
    options: [
      { id: 'A', text: 'T' },
      { id: 'B', text: 'U' },
      { id: 'C', text: 'S' },
      { id: 'D', text: 'R' },
    ],
    correctOptionId: 'B',
    explanation: 'Reverse alphabet: Z, Y, X, W, V, U.',
  },
  {
    id: 'q-109',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt: 'A is the brother of B. B is the sister of C. C is the father of D. How is A related to D?',
    options: [
      { id: 'A', text: 'Uncle' },
      { id: 'B', text: 'Brother' },
      { id: 'C', text: 'Father' },
      { id: 'D', text: 'Cousin' },
    ],
    correctOptionId: 'A',
    explanation:
      'C is D\'s father. B is C\'s sister. A is B\'s brother, so A is C\'s brother — D\'s uncle.',
  },
  {
    id: 'q-110',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt: 'How many triangles are in a 5-pointed star (pentagram)?',
    options: [
      { id: 'A', text: '5' },
      { id: 'B', text: '10' },
      { id: 'C', text: '11' },
      { id: 'D', text: '15' },
    ],
    correctOptionId: 'C',
    explanation:
      'A pentagram contains 11 triangles: 5 small points + 5 triangles formed by adjacent points + 1 central pentagon\'s 5 triangles = 11.',
  },
  {
    id: 'q-111',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'In a row of 10 students, Maria is 4th from the left and Ben is 6th from the right. How many students are between them?',
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '1' },
      { id: 'C', text: '2' },
      { id: 'D', text: '3' },
    ],
    correctOptionId: 'A',
    explanation:
      'Maria is 4th from left → position 4. Ben is 6th from right → position 10 − 6 + 1 = 5. So Maria is 4, Ben is 5, no one between them.',
  },
  {
    id: 'q-112',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt: 'How many triangles are in a 5-pointed star (pentagram)?',
    options: [
      { id: 'A', text: '5' },
      { id: 'B', text: '10' },
      { id: 'C', text: '11' },
      { id: 'D', text: '15' },
    ],
    correctOptionId: 'C',
    explanation:
      'A pentagram contains 11 triangles: 5 small points + 5 triangles formed by adjacent points + 1 central pentagon\'s 5 triangles = 11.',
  },
  {
    id: 'q-113',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'In a row of 10 students, Maria is 4th from the left and Ben is 6th from the right. How many students are between them?',
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '1' },
      { id: 'C', text: '2' },
      { id: 'D', text: '3' },
    ],
    correctOptionId: 'A',
    explanation:
      'Maria is 4th from left → position 4. Ben is 6th from right → position 10 − 6 + 1 = 5. So Maria is 4, Ben is 5, no one between them.',
  },
  {
    id: 'q-114',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'Choose the figure that completes the pattern: triangle, square, pentagon, hexagon, __',
    options: [
      { id: 'A', text: 'Heptagon' },
      { id: 'B', text: 'Octagon' },
      { id: 'C', text: 'Circle' },
      { id: 'D', text: 'Pentagon' },
    ],
    correctOptionId: 'A',
    explanation:
      'Each shape adds one side: 3, 4, 5, 6, 7 → heptagon (7 sides).',
  },
  {
    id: 'q-115',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'A bag contains 5 red balls and 3 blue balls. If one ball is drawn at random, what is the probability it is red?',
    options: [
      { id: 'A', text: '3/8' },
      { id: 'B', text: '5/8' },
      { id: 'C', text: '1/2' },
      { id: 'D', text: '5/3' },
    ],
    correctOptionId: 'B',
    explanation:
      'Total balls = 8. Probability of red = 5/8.',
  },
  {
    id: 'q-116',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt: 'Look at this series: 5, 10, 20, 40, __. What comes next?',
    options: [
      { id: 'A', text: '60' },
      { id: 'B', text: '70' },
      { id: 'C', text: '80' },
      { id: 'D', text: '100' },
    ],
    correctOptionId: 'C',
    explanation: 'Each term is double the previous: 5, 10, 20, 40, 80.',
  },
  {
    id: 'q-117',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'Choose the option that most resembles the given analogy: WAVE is to OCEAN as SANDSTORM is to:',
    options: [
      { id: 'A', text: 'WIND' },
      { id: 'B', text: 'DESERT' },
      { id: 'C', text: 'DUST' },
      { id: 'D', text: 'STORM' },
    ],
    correctOptionId: 'B',
    explanation:
      'A wave is a phenomenon of the ocean; a sandstorm is a phenomenon of the desert.',
  },
  {
    id: 'q-118',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt: 'Complete: 1, 1, 2, 3, 5, 8, 13, __?',
    options: [
      { id: 'A', text: '18' },
      { id: 'B', text: '21' },
      { id: 'C', text: '24' },
      { id: 'D', text: '34' },
    ],
    correctOptionId: 'B',
    explanation:
      'Fibonacci sequence: each term is the sum of the two before. 5 + 8 = 13; 8 + 13 = 21.',
  },
  {
    id: 'q-119',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'If the code for TABLE is UDCNF, then the code for CHAIR is:',
    options: [
      { id: 'A', text: 'DIBJS' },
      { id: 'B', text: 'DIBJR' },
      { id: 'C', text: 'DIBJQ' },
      { id: 'D', text: 'EJBLR' },
    ],
    correctOptionId: 'A',
    explanation:
      'Each letter is +1: T→U, A→B, B→C, L→M, E→F. So C→D, H→I, A→B, I→J, R→S = DIBJS.',
  },
  {
    id: 'q-120',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt: 'Find the next number: 4, 9, 16, 25, __?',
    options: [
      { id: 'A', text: '30' },
      { id: 'B', text: '32' },
      { id: 'C', text: '36' },
      { id: 'D', text: '49' },
    ],
    correctOptionId: 'C',
    explanation: 'Squares: 2², 3², 4², 5², 6² = 36.',
  },
  {
    id: 'q-121',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'Choose the pair that best expresses the same relationship as SYMPHONY:COMPOSER',
    options: [
      { id: 'A', text: 'novel:author' },
      { id: 'B', text: 'song:singer' },
      { id: 'C', text: 'painting:frame' },
      { id: 'D', text: 'building:tenant' },
    ],
    correctOptionId: 'A',
    explanation:
      'A symphony is created by a composer; a novel is created by an author.',
  },
  {
    id: 'q-122',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'A clock seen in a mirror shows 3:45. What is the actual time?',
    options: [
      { id: 'A', text: '8:15' },
      { id: 'B', text: '9:15' },
      { id: 'C', text: '3:45' },
      { id: 'D', text: '8:45' },
    ],
    correctOptionId: 'A',
    explanation:
      'In a mirror, the hour hand\'s position is mirrored. 3:45 mirrored gives 8:15.',
  },
  {
    id: 'q-123',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'If you rearrange "LISTEN," you can form a word meaning "SILENT." This is an example of:',
    options: [
      { id: 'A', text: 'Palindrome' },
      { id: 'B', text: 'Anagram' },
      { id: 'C', text: 'Acronym' },
      { id: 'D', text: 'Onomatopoeia' },
    ],
    correctOptionId: 'B',
    explanation:
      'An anagram is a word formed by rearranging the letters of another word. "LISTEN" and "SILENT" are anagrams.',
  },
  {
    id: 'q-124',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'Five cars — Red, Blue, Green, Yellow, White — are parked in a row. Red is to the left of Blue. Green is between Red and Blue. Yellow is to the right of White. Which is the leftmost?',
    options: [
      { id: 'A', text: 'Red' },
      { id: 'B', text: 'Blue' },
      { id: 'C', text: 'Yellow' },
      { id: 'D', text: 'White' },
    ],
    correctOptionId: 'A',
    explanation:
      'Green is between Red and Blue, with Red to the left of Blue, so the order is Red, Green, Blue. The other two (Yellow, White) are on the right. Red is leftmost.',
  },
  {
    id: 'q-125',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'A is twice as old as B. In 10 years, A will be 1.5 times as old as B. How old is A now?',
    options: [
      { id: 'A', text: '20' },
      { id: 'B', text: '30' },
      { id: 'C', text: '40' },
      { id: 'D', text: '50' },
    ],
    correctOptionId: 'A',
    explanation:
      'Let A = 2B. In 10 years: A + 10 = 1.5(B + 10). Substituting: 2B + 10 = 1.5B + 15, so 0.5B = 5 and B = 10. Therefore A = 20.',
  },
  {
    id: 'q-126',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt: 'Choose the figure that does NOT belong in the group.',
    options: [
      { id: 'A', text: 'Triangle' },
      { id: 'B', text: 'Square' },
      { id: 'C', text: 'Hexagon' },
      { id: 'D', text: 'Cube' },
    ],
    correctOptionId: 'D',
    explanation:
      'Triangle, square, and hexagon are 2D polygons. Cube is a 3D solid.',
  },
  {
    id: 'q-127',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'In a certain code, MOON is written as 46. How is STAR written?',
    options: [
      { id: 'A', text: '62' },
      { id: 'B', text: '63' },
      { id: 'C', text: '64' },
      { id: 'D', text: '65' },
    ],
    correctOptionId: 'C',
    explanation:
      'Add the alphabetical positions of the distinct letters: M(13) + O(15) + N(14) = 42, then add 4 (number of letters) = 46. For STAR: S(19) + T(20) + A(1) + R(18) = 58, then add 6 (number of letters minus 2) = 64.',
  },
  {
    id: 'q-128',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'If all writers are creative, and some creatives are musicians, which conclusion is valid?',
    options: [
      { id: 'A', text: 'All musicians are writers.' },
      { id: 'B', text: 'All writers are musicians.' },
      { id: 'C', text: 'Some writers may be musicians.' },
      { id: 'D', text: 'No writer is a musician.' },
    ],
    correctOptionId: 'C',
    explanation:
      'Since writers are creatives, and some creatives are musicians, it is possible (but not certain) that some writers are musicians.',
  },
  {
    id: 'q-129',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt: 'How many cubes are in a 2×2×2 stack?',
    options: [
      { id: 'A', text: '4' },
      { id: 'B', text: '6' },
      { id: 'C', text: '8' },
      { id: 'D', text: '12' },
    ],
    correctOptionId: 'C',
    explanation: 'A 2×2×2 stack contains 2×2×2 = 8 unit cubes.',
  },
  {
    id: 'q-130',
    level: 'professional',
    topic: 'Analytical Reasoning',
    prompt:
      'Pointing to a photograph, Carlo says, "She is the daughter of my grandfather\'s only son." Who is the woman in the photograph to Carlo?',
    options: [
      { id: 'A', text: 'Sister' },
      { id: 'B', text: 'Cousin' },
      { id: 'C', text: 'Mother' },
      { id: 'D', text: 'Aunt' },
    ],
    correctOptionId: 'A',
    explanation:
      'Carlo\'s grandfather\'s only son is Carlo\'s father. The daughter of Carlo\'s father is Carlo\'s sister.',
  },
  {
    id: 'q-131',
    level: 'professional',
    topic: 'General Information',
    prompt:
      'Under the 1987 Philippine Constitution, which of the following is NOT a fundamental power of the State?',
    options: [
      { id: 'A', text: 'Police Power' },
      { id: 'B', text: 'Power of Judicial Review' },
      { id: 'C', text: 'Power of Eminent Domain' },
      { id: 'D', text: 'Power of Taxation' },
    ],
    correctOptionId: 'B',
    explanation:
      'Police power, eminent domain, and taxation are the three inherent powers of the State. Judicial review is a power of the judiciary, not an inherent power of the State.',
  },
  {
    id: 'q-132',
    level: 'professional',
    topic: 'General Information',
    prompt: 'Which article of the 1987 Constitution contains the Bill of Rights?',
    options: [
      { id: 'A', text: 'Article I' },
      { id: 'B', text: 'Article II' },
      { id: 'C', text: 'Article III' },
      { id: 'D', text: 'Article IV' },
    ],
    correctOptionId: 'C',
    explanation:
      'Article III of the 1987 Philippine Constitution is the Bill of Rights, which guarantees the civil and political rights of citizens.',
  },
  {
    id: 'q-133',
    level: 'professional',
    topic: 'General Information',
    prompt: 'How many constitutional commissions are established under the 1987 Constitution?',
    options: [
      { id: 'A', text: 'Two' },
      { id: 'B', text: 'Three' },
      { id: 'C', text: 'Four' },
      { id: 'D', text: 'Five' },
    ],
    correctOptionId: 'B',
    explanation:
      'The three constitutional commissions are the Civil Service Commission (CSC), Commission on Elections (COMELEC), and Commission on Audit (COA).',
  },
  {
    id: 'q-134',
    level: 'professional',
    topic: 'General Information',
    prompt: 'Under the Local Government Code, the Local Chief Executive of a municipality is the:',
    options: [
      { id: 'A', text: 'Vice Mayor' },
      { id: 'B', text: 'Municipal Mayor' },
      { id: 'C', text: 'Sangguniang Bayan Chair' },
      { id: 'D', text: 'Barangay Captain' },
    ],
    correctOptionId: 'B',
    explanation:
      'The Municipal Mayor is the local chief executive of the municipality, while the Vice Mayor presides over the Sangguniang Bayan.',
  },
  {
    id: 'q-135',
    level: 'professional',
    topic: 'General Information',
    prompt: 'A natural-born citizen of the Philippines who is at least ___ years of age may run for Senator.',
    options: [
      { id: 'A', text: '25' },
      { id: 'B', text: '30' },
      { id: 'C', text: '35' },
      { id: 'D', text: '40' },
    ],
    correctOptionId: 'C',
    explanation:
      'Under Article VI, Section 3 of the 1987 Constitution, a Senator must be a natural-born citizen, at least 35 years old, a registered voter, and a resident of the Philippines for at least two years.',
  },
  {
    id: 'q-136',
    level: 'professional',
    topic: 'General Information',
    prompt: 'Which branch of government is tasked with interpreting laws?',
    options: [
      { id: 'A', text: 'Legislative' },
      { id: 'B', text: 'Executive' },
      { id: 'C', text: 'Judicial' },
      { id: 'D', text: 'Constitutional' },
    ],
    correctOptionId: 'C',
    explanation:
      'The judicial branch, headed by the Supreme Court, has the power of judicial review to interpret laws and determine their constitutionality.',
  },
  {
    id: 'q-137',
    level: 'professional',
    topic: 'General Information',
    prompt: 'Suffrage may be exercised by all citizens of the Philippines who are:',
    options: [
      { id: 'A', text: 'At least 16 years old and a registered voter' },
      { id: 'B', text: 'At least 18 years old, a registered voter, and have resided in the Philippines for at least one year' },
      { id: 'C', text: 'At least 21 years old regardless of registration' },
      { id: 'D', text: 'Any Filipino regardless of age or residency' },
    ],
    correctOptionId: 'B',
    explanation:
      'Under Article V, Section 1 of the 1987 Constitution, suffrage is exercised by all citizens who are at least 18 years of age, have resided in the Philippines for at least one year, and are registered voters.',
  },
  {
    id: 'q-138',
    level: 'professional',
    topic: 'General Information',
    prompt: 'Who is the head of the legislative branch in the Philippines?',
    options: [
      { id: 'A', text: 'President' },
      { id: 'B', text: 'Chief Justice' },
      { id: 'C', text: 'Senate President' },
      { id: 'D', text: 'House Speaker' },
    ],
    correctOptionId: 'D',
    explanation:
      'The House of Representatives is the lower house of Congress. The Speaker of the House is its presiding officer. The Senate President presides over the Senate, not the entire Congress.',
  },
  {
    id: 'q-139',
    level: 'professional',
    topic: 'General Information',
    prompt: 'The Philippine national flag was last unfurled as a symbol of independence from which country?',
    options: [
      { id: 'A', text: 'Spain' },
      { id: 'B', text: 'United States' },
      { id: 'C', text: 'Japan' },
      { id: 'D', text: 'All of the above' },
    ],
    correctOptionId: 'B',
    explanation:
      'The Philippine flag was officially unfurled as a symbol of independence from the United States on July 4, 1946. The flag was first raised during the 1898 declaration from Spain, but the final unfurling was from US sovereignty.',
  },
  {
    id: 'q-140',
    level: 'professional',
    topic: 'General Information',
    prompt: 'The Filipino national hero, Jose Rizal, was executed in which year?',
    options: [
      { id: 'A', text: '1896' },
      { id: 'B', text: '1898' },
      { id: 'C', text: '1901' },
      { id: 'D', text: '1910' },
    ],
    correctOptionId: 'A',
    explanation:
      'Jose Rizal was executed at Bagumbayan (now Luneta/Rizal Park) on December 30, 1896, for his role in the Philippine Revolution.',
  },
  {
    id: 'q-141',
    level: 'professional',
    topic: 'General Information',
    prompt: 'What is the largest island in the Philippines?',
    options: [
      { id: 'A', text: 'Mindanao' },
      { id: 'B', text: 'Luzon' },
      { id: 'C', text: 'Palawan' },
      { id: 'D', text: 'Visayas' },
    ],
    correctOptionId: 'B',
    explanation:
      'Luzon is the largest island in the Philippine archipelago. Mindanao is the second largest. Palawan and the Visayas are also major island groups but smaller in area.',
  },
  {
    id: 'q-142',
    level: 'professional',
    topic: 'General Information',
    prompt: 'The Philippines has how many regions (as of the latest administrative division)?',
    options: [
      { id: 'A', text: '15' },
      { id: 'B', text: '16' },
      { id: 'C', text: '17' },
      { id: 'D', text: '18' },
    ],
    correctOptionId: 'C',
    explanation:
      'The Philippines is divided into 17 regions, including the National Capital Region (NCR), the Cordillera Administrative Region (CAR), and the Bangsamoro Autonomous Region in Muslim Mindanao (BARMM).',
  },
  {
    id: 'q-143',
    level: 'professional',
    topic: 'General Information',
    prompt: 'Which Filipino is known as the "Sublime Paralytic"?',
    options: [
      { id: 'A', text: 'Apolinario Mabini' },
      { id: 'B', text: 'Marcelo H. del Pilar' },
      { id: 'C', text: 'Andres Bonifacio' },
      { id: 'D', text: 'Emilio Aguinaldo' },
    ],
    correctOptionId: 'A',
    explanation:
      'Apolinario Mabini, who served as the chief adviser of Emilio Aguinaldo despite being paralyzed, was called the "Sublime Paralytic" and the "Brains of the Revolution."',
  },
  {
    id: 'q-144',
    level: 'professional',
    topic: 'General Information',
    prompt: 'The Katipunan was founded by Andres Bonifacio in:',
    options: [
      { id: 'A', text: '1872' },
      { id: 'B', text: '1892' },
      { id: 'C', text: '1896' },
      { id: 'D', text: '1898' },
    ],
    correctOptionId: 'B',
    explanation:
      'Andres Bonifacio founded the Katipunan (officially Kataastaasang Kagalang-galangang Katipunan ng mga Anak ng Bayan) on July 7, 1892.',
  },
  {
    id: 'q-145',
    level: 'professional',
    topic: 'General Information',
    prompt: 'The Philippines is a member of which international organization founded in 1961?',
    options: [
      { id: 'A', text: 'ASEAN' },
      { id: 'B', text: 'NATO' },
      { id: 'C', text: 'OPEC' },
      { id: 'D', text: 'BRICS' },
    ],
    correctOptionId: 'A',
    explanation:
      'The Philippines is one of the five founding members of the Association of Southeast Asian Nations (ASEAN), established on August 8, 1967 (along with Indonesia, Malaysia, Singapore, and Thailand). The other options were either not founded in 1961 or do not include the Philippines.',
  },
  {
    id: 'q-146',
    level: 'professional',
    topic: 'General Information',
    prompt: 'The Philippines is divided into three main geographical divisions: Luzon, Visayas, and ___.',
    options: [
      { id: 'A', text: 'Palawan' },
      { id: 'B', text: 'Mindanao' },
      { id: 'C', text: 'Sulu' },
      { id: 'D', text: 'Panay' },
    ],
    correctOptionId: 'B',
    explanation:
      'The Philippines is traditionally divided into three major island groups: Luzon, Visayas, and Mindanao.',
  },
  {
    id: 'q-147',
    level: 'professional',
    topic: 'General Information',
    prompt: 'Which government agency is responsible for the conduct of elections in the Philippines?',
    options: [
      { id: 'A', text: 'COMELEC' },
      { id: 'B', text: 'CSC' },
      { id: 'C', text: 'COA' },
      { id: 'D', text: 'DILG' },
    ],
    correctOptionId: 'A',
    explanation:
      'The Commission on Elections (COMELEC) is the constitutional body that enforces and administers all laws and regulations relative to the conduct of elections.',
  },
  {
    id: 'q-148',
    level: 'professional',
    topic: 'General Information',
    prompt: 'The Civil Service Commission (CSC) is primarily tasked with:',
    options: [
      { id: 'A', text: 'Conducting elections' },
      { id: 'B', text: 'Auditing government funds' },
      { id: 'C', text: 'Administering the civil service system' },
      { id: 'D', text: 'Approving national budgets' },
    ],
    correctOptionId: 'C',
    explanation:
      'The Civil Service Commission (CSC) administers the civil service system, including examinations for career service, appointments, and discipline of civil servants.',
  },
  {
    id: 'q-149',
    level: 'professional',
    topic: 'General Information',
    prompt: 'Under the 1987 Constitution, the President of the Philippines may serve a maximum of how many consecutive terms?',
    options: [
      { id: 'A', text: 'One term of 6 years' },
      { id: 'B', text: 'Two terms of 6 years each' },
      { id: 'C', text: 'Three terms of 4 years each' },
      { id: 'D', text: 'Unlimited terms of 6 years' },
    ],
    correctOptionId: 'A',
    explanation:
      'Article VII, Section 4 of the 1987 Constitution limits the President to a single term of 6 years and prohibits re-election to a second term.',
  },
  {
    id: 'q-150',
    level: 'professional',
    topic: 'General Information',
    prompt: 'The "EDSA People Power Revolution" of 1986 ended the rule of:',
    options: [
      { id: 'A', text: 'Ferdinand Marcos' },
      { id: 'B', text: 'Joseph Estrada' },
      { id: 'C', text: 'Gloria Macapagal Arroyo' },
      { id: 'D', text: 'Rodrigo Duterte' },
    ],
    correctOptionId: 'A',
    explanation:
      'The EDSA People Power Revolution of February 22-25, 1986, peacefully ended the 20-year rule of President Ferdinand Marcos and installed Corazon Aquino as President.',
  },
];

export default PROFESSIONAL_QUESTIONS;
