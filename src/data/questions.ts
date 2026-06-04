import type { Question } from '../types';

export const EXAM_DURATION_SECONDS = 60 * 60 * 2 + 60 * 44 + 55;
export const PASSING_SCORE = 80;

export const QUESTION_BANK: Question[] = [
  {
    id: 'q-001',
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
    id: 'q-008',
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
    id: 'q-009',
    topic: 'Numerical Ability',
    prompt: 'If the ratio of boys to girls in a class is 3:5 and there are 24 boys, how many girls are there?',
    options: [
      { id: 'A', text: '30' },
      { id: 'B', text: '36' },
      { id: 'C', text: '40' },
      { id: 'D', text: '48' },
    ],
    correctOptionId: 'C',
    explanation:
      '3:5 = 24:x. So x = (5 × 24) / 3 = 40.',
  },
  {
    id: 'q-010',
    topic: 'Numerical Ability',
    prompt: 'The average of five numbers is 18. If one number is removed, the average becomes 16. What number was removed?',
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
    id: 'q-011',
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
    id: 'q-012',
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
    id: 'q-013',
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
    id: 'q-014',
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
    id: 'q-015',
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
    id: 'q-016',
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
    id: 'q-017',
    topic: 'Analytical Reasoning',
    prompt:
      'Five friends — Ana, Ben, Carlo, Dina, and Eli — sit in a row. Ana is not at either end. Ben is to the right of Ana. Carlo is next to Dina. Who could be at the far left?',
    options: [
      { id: 'A', text: 'Ana' },
      { id: 'B', text: 'Ben' },
      { id: 'C', text: 'Carlo' },
      { id: 'D', text: 'Dina' },
    ],
    correctOptionId: 'C',
    explanation:
      'Ana cannot be at either end. Ben is to Ana\'s right. Trying placements: if Carlo is at the far left, a valid arrangement (Carlo, Ana, Dina, Ben, Eli) satisfies all conditions.',
  },
  {
    id: 'q-018',
    topic: 'Analytical Reasoning',
    prompt:
      'A statement: "If it rains, the picnic is cancelled." The picnic is NOT cancelled. What can we conclude?',
    options: [
      { id: 'A', text: 'It rained.' },
      { id: 'B', text: 'It did not rain.' },
      { id: 'C', text: 'It might have rained.' },
      { id: 'D', text: 'Nothing can be concluded.' },
    ],
    correctOptionId: 'B',
    explanation:
      'This is the contrapositive: If rain → cancelled, then NOT cancelled → NOT rain.',
  },
  {
    id: 'q-019',
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
    id: 'q-020',
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
    id: 'q-021',
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
    id: 'q-022',
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
    id: 'q-023',
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
    id: 'q-024',
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
    id: 'q-025',
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
];
