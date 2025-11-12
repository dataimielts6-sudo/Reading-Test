export enum QuestionType {
  TRUE_FALSE_NOT_GIVEN,
  NOTE_COMPLETION,
  MATCHING_HEADINGS,
  MATCHING_PEOPLE,
  SUMMARY_COMPLETION,
  MULTIPLE_CHOICE,
  SENTENCE_COMPLETION,
  MULTIPLE_CHOICE_MULTIPLE,
  SUMMARY_COMPLETION_OPTIONS,
}

export interface Question {
  id: number;
  type: QuestionType;
  instructions: string;
  questionGroupTitle?: string;
  questions: QuestionDetail[];
  options?: string[];
}

export interface QuestionDetail {
    q_id: number;
    text: string;
    options?: string[];
    subtext?: string;
}

export interface Passage {
  title: string;
  subtitle: string;
  content: { type: 'p' | 'h'; text: string }[];
}

export interface TestPart {
  part: number;
  passage: Passage;
  questions: Question[];
}

export type Answer = { [key: number]: string };