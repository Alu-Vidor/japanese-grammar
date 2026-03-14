export type GrammarPoint = {
  title: string
  rule: string
  examples: string[]
}

export type VocabularyItem = {
  jp: string
  reading: string
  ru: string
}

export type SentenceBuilderExercise = {
  id: string
  type: 'builder'
  prompt: string
  tokens: string[]
  answer: string[]
}

export type FormExercise = {
  id: string
  type: 'form'
  prompt: string
  base: string
  instruction: string
  answer: string[]
}

export type ChoiceExercise = {
  id: string
  type: 'choice'
  prompt: string
  options: string[]
  answer: string
  explanation: string
}

export type PracticeExercise = SentenceBuilderExercise | FormExercise | ChoiceExercise

export type ClozeExercise = {
  title: string
  textParts: string[]
  blanks: {
    id: string
    placeholder: string
    answer: string[]
  }[]
}

export type Lesson = {
  id: string
  title: string
  goal: string
  coverage: string[]
  grammar: GrammarPoint[]
  vocabulary: VocabularyItem[]
  practice: PracticeExercise[]
  cloze: ClozeExercise
}

export type ExamQuestion =
  | {
      id: string
      type: 'choice'
      prompt: string
      options: string[]
      answer: string
      explanation: string
    }
  | {
      id: string
      type: 'gap'
      prompt: string
      answer: string[]
      explanation: string
    }
