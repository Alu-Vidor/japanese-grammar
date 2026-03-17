export type GrammarPoint = {
  title: string
  rule: string
  examples: string[]
  translations?: string[]
}

export type LessonStory = {
  stopLabel: string
  location: string
  scene: string
  characters: string[]
  visuals: string[]
  animations: string[]
  reward: string
}

export type VisualReference = {
  label: string
  url: string
}

export type LessonUpgrade = {
  weakSpots: string[]
  engagementBoosts: string[]
  animationIdeas: string[]
  japaneseDetails: string[]
  transitions: string[]
  finale: string[]
  photoRefs: VisualReference[]
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

export type ChoiceExercise = {
  id: string
  type: 'choice'
  prompt: string
  options: string[]
  answer: string
  explanation: string
}

export type PracticeExercise = SentenceBuilderExercise | ChoiceExercise

export type ClozeChoiceBlank = {
  id: string
  options: string[]
  answer: string
}

export type ClozeExercise = {
  title: string
  textParts: string[]
  blanks: ClozeChoiceBlank[]
}

export type Lesson = {
  id: string
  title: string
  goal: string
  hook?: string
  microResult?: string
  coverage: string[]
  japanContext: string
  story?: LessonStory
  grammar: GrammarPoint[]
  vocabulary: VocabularyItem[]
  practice: PracticeExercise[]
  cloze: ClozeExercise
}

export type ExamQuestion = {
  id: string
  type: 'choice'
  prompt: string
  options: string[]
  answer: string
  explanation: string
}


