import { Fragment, useMemo, useState, type ReactNode } from 'react'
import './App.css'
import {
  N5_GRAMMAR_CHECKLIST,
  finalExam,
  lessons,
  type ChoiceExercise,
  type ExamQuestion,
  type Lesson,
  type PracticeExercise,
  type SentenceBuilderExercise,
} from './data'

type LessonScore = { correct: number; total: number; passed: boolean }
type ExamResult = { correct: number; total: number; passed: boolean }

const LESSON_PASS_RATE = 0.75
const EXAM_PASS_RATE = 0.75
const FURIGANA_RE = /\{([^|{}]+)\|([^{}]+)\}/g

const normalize = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, ' ')
const countToken = (items: string[], token: string): number => items.filter((item) => item === token).length
const getBuilderKey = (lessonId: string, exerciseId: string): string => `${lessonId}::${exerciseId}`

function JPText({ text }: { text: string }) {
  const parts: ReactNode[] = []
  let lastIndex = 0
  let index = 0

  for (const match of text.matchAll(FURIGANA_RE)) {
    const start = match.index ?? 0
    if (start > lastIndex) {
      parts.push(<Fragment key={`text-${index++}`}>{text.slice(lastIndex, start)}</Fragment>)
    }
    parts.push(
      <ruby key={`ruby-${index++}`}>
        {match[1]}
        <rt>{match[2]}</rt>
      </ruby>,
    )
    lastIndex = start + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(<Fragment key={`text-${index++}`}>{text.slice(lastIndex)}</Fragment>)
  }

  return <>{parts}</>
}

function App() {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({})
  const [clozeAnswers, setClozeAnswers] = useState<Record<string, string>>({})
  const [builderDraft, setBuilderDraft] = useState<Record<string, string[]>>({})
  const [lessonScores, setLessonScores] = useState<Record<string, LessonScore>>({})
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({})
  const [examResult, setExamResult] = useState<ExamResult | null>(null)

  const currentLesson = lessons[currentLessonIndex]

  const completedLessons = useMemo(
    () => lessons.filter((lesson) => lessonScores[lesson.id]?.passed).length,
    [lessonScores],
  )

  const coverage = useMemo(() => {
    const covered = new Set(lessons.flatMap((lesson) => lesson.coverage))
    return {
      covered: N5_GRAMMAR_CHECKLIST.filter((item) => covered.has(item.id)).length,
      total: N5_GRAMMAR_CHECKLIST.length,
      missing: N5_GRAMMAR_CHECKLIST.filter((item) => !covered.has(item.id)),
    }
  }, [])

  const isExamUnlocked = completedLessons === lessons.length
  const isLessonUnlocked = (index: number): boolean => index === 0 || Boolean(lessonScores[lessons[index - 1].id]?.passed)

  const getBuiltTokens = (lessonId: string, exerciseId: string): string[] =>
    builderDraft[getBuilderKey(lessonId, exerciseId)] ?? []

  const addToken = (lessonId: string, exercise: SentenceBuilderExercise, token: string): void => {
    const key = getBuilderKey(lessonId, exercise.id)
    const built = getBuiltTokens(lessonId, exercise.id)
    if (countToken(built, token) >= countToken(exercise.tokens, token)) return
    setBuilderDraft((prev) => ({ ...prev, [key]: [...built, token] }))
  }

  const removeToken = (lessonId: string, exerciseId: string, index: number): void => {
    const key = getBuilderKey(lessonId, exerciseId)
    const built = getBuiltTokens(lessonId, exerciseId)
    setBuilderDraft((prev) => ({ ...prev, [key]: built.filter((_, i) => i !== index) }))
  }

  const clearTokens = (lessonId: string, exerciseId: string): void => {
    setBuilderDraft((prev) => ({ ...prev, [getBuilderKey(lessonId, exerciseId)]: [] }))
  }

  const evaluatePractice = (lesson: Lesson): { correct: number; total: number } => {
    let correct = 0

    lesson.practice.forEach((exercise) => {
      if (exercise.type === 'builder') {
        const built = getBuiltTokens(lesson.id, exercise.id)
        if (normalize(built.join(' ')) === normalize(exercise.answer.join(' '))) correct += 1
      }
      if (exercise.type === 'choice') {
        if (normalize(practiceAnswers[exercise.id] ?? '') === normalize(exercise.answer)) correct += 1
      }
    })

    return { correct, total: lesson.practice.length }
  }

  const evaluateCloze = (lesson: Lesson): { correct: number; total: number } => {
    let correct = 0
    lesson.cloze.blanks.forEach((blank) => {
      if (normalize(clozeAnswers[blank.id] ?? '') === normalize(blank.answer)) correct += 1
    })
    return { correct, total: lesson.cloze.blanks.length }
  }

  const checkLesson = (lesson: Lesson): void => {
    const practice = evaluatePractice(lesson)
    const cloze = evaluateCloze(lesson)
    const total = practice.total + cloze.total
    const correct = practice.correct + cloze.correct
    const passed = correct / total >= LESSON_PASS_RATE

    setLessonScores((prev) => ({ ...prev, [lesson.id]: { correct, total, passed } }))
    if (passed && currentLessonIndex < lessons.length - 1) setCurrentLessonIndex((prev) => prev + 1)
  }

  const checkExam = (): void => {
    let correct = 0
    finalExam.forEach((question) => {
      if (normalize(examAnswers[question.id] ?? '') === normalize(question.answer)) correct += 1
    })
    const total = finalExam.length
    setExamResult({ correct, total, passed: correct / total >= EXAM_PASS_RATE })
  }

  const currentScore = lessonScores[currentLesson.id]

  return (
    <main className="app-shell">
      <header className="hero-block">
        <p className="eyebrow">Japanese Grammar Trainer</p>
        <h1>JLPT N5: атомарный курс грамматики</h1>
        <p className="subtitle">Каждый урок закрывает одну тему, с контекстом реальной Японии и заданиями без ввода текста.</p>
        <p className="progress">Пройдено уроков: {completedLessons}/{lessons.length}</p>
        <p className="progress">Покрытие N5: {coverage.covered}/{coverage.total}</p>
        {coverage.missing.length === 0 ? (
          <p className="result ok">Покрытие полное: все темы чек-листа N5 включены.</p>
        ) : (
          <p className="result bad">Не покрыто: {coverage.missing.map((x) => x.label).join(', ')}</p>
        )}
      </header>

      <section className="layout">
        <aside className="sidebar">
          <h2>Уроки</h2>
          <ul>
            {lessons.map((lesson, index) => {
              const unlocked = isLessonUnlocked(index)
              const score = lessonScores[lesson.id]
              return (
                <li key={lesson.id}>
                  <button
                    type="button"
                    className={`lesson-tab ${index === currentLessonIndex ? 'active' : ''}`}
                    onClick={() => setCurrentLessonIndex(index)}
                    disabled={!unlocked}
                  >
                    <span>{lesson.title}</span>
                    <span className="status">{score ? `${score.correct}/${score.total}` : unlocked ? 'Открыт' : 'Закрыт'}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        <article className="content-card">
          <section className="lesson-header">
            <h2>{currentLesson.title}</h2>
            <p>{currentLesson.goal}</p>
            <p className="hint">{currentLesson.japanContext}</p>
          </section>

          <section>
            <h3>1) Правило</h3>
            <div className="grid">
              {currentLesson.grammar.map((point) => (
                <div className="panel" key={point.title}>
                  <h4>{point.title}</h4>
                  <p>{point.rule}</p>
                  <ul>
                    {point.examples.map((example) => (
                      <li key={example}><JPText text={example} /></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3>2) Лексика</h3>
            <div className="vocabulary-grid">
              {currentLesson.vocabulary.map((item) => (
                <article key={`${item.jp}-${item.reading}`} className="word-card">
                  <p className="jp"><JPText text={item.jp} /></p>
                  <p>{item.reading}</p>
                  <p>{item.ru}</p>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h3>3) Практика</h3>
            <div className="exercise-stack">
              {currentLesson.practice.map((exercise) => (
                <PracticeBlock
                  key={exercise.id}
                  lessonId={currentLesson.id}
                  exercise={exercise}
                  value={practiceAnswers[exercise.id] ?? ''}
                  builtTokens={getBuiltTokens(currentLesson.id, exercise.id)}
                  onPick={(id, value) => setPracticeAnswers((prev) => ({ ...prev, [id]: value }))}
                  onAddToken={addToken}
                  onRemoveToken={removeToken}
                  onClearTokens={clearTokens}
                />
              ))}
            </div>
          </section>

          <section>
            <h3>4) Текст с вариантами в пропусках</h3>
            <div className="panel cloze-panel">
              <h4>{currentLesson.cloze.title}</h4>
              <p className="cloze-text">
                {currentLesson.cloze.textParts.map((part, idx) => (
                  <span key={`${currentLesson.id}-part-${idx}`}>
                    <JPText text={part} />
                    {idx < currentLesson.cloze.blanks.length ? (
                      <span className="inline-choice">
                        {currentLesson.cloze.blanks[idx].options.map((option) => {
                          const blank = currentLesson.cloze.blanks[idx]
                          const selected = clozeAnswers[blank.id] === option
                          return (
                            <button
                              type="button"
                              key={`${blank.id}-${option}`}
                              className={`mini-option ${selected ? 'selected' : ''}`}
                              onClick={() => setClozeAnswers((prev) => ({ ...prev, [blank.id]: option }))}
                            >
                              <JPText text={option} />
                            </button>
                          )
                        })}
                      </span>
                    ) : null}
                  </span>
                ))}
              </p>
            </div>
          </section>

          <section className="lesson-actions">
            <button type="button" className="primary" onClick={() => checkLesson(currentLesson)}>Проверить урок</button>
            {currentScore ? (
              <p className={currentScore.passed ? 'result ok' : 'result bad'}>
                Результат: {currentScore.correct}/{currentScore.total}. Порог: 75%.
              </p>
            ) : (
              <p className="result">Порог прохождения урока: 75%.</p>
            )}
          </section>
        </article>
      </section>

      <section className="exam-section">
        <div className="exam-head">
          <h2>Финальный грамматический тест N5</h2>
          <p>Экзамен открыт: <strong>{isExamUnlocked ? 'да' : 'нет'}</strong></p>
        </div>
        <div className={`exam-card ${isExamUnlocked ? '' : 'locked'}`}>
          {!isExamUnlocked ? (
            <p>Пройди все уроки, и тест откроется.</p>
          ) : (
            <>
              <div className="exam-grid">
                {finalExam.map((q) => (
                  <ExamQuestionBlock
                    key={q.id}
                    question={q}
                    value={examAnswers[q.id] ?? ''}
                    onChange={(id, value) => setExamAnswers((prev) => ({ ...prev, [id]: value }))}
                  />
                ))}
              </div>
              <button type="button" className="primary" onClick={checkExam}>Проверить экзамен</button>
              {examResult ? (
                <p className={examResult.passed ? 'result ok' : 'result bad'}>
                  Экзамен: {examResult.correct}/{examResult.total}. {examResult.passed ? 'Зачет!' : 'Нужно 75% и выше.'}
                </p>
              ) : null}
            </>
          )}
        </div>
      </section>
    </main>
  )
}

type PracticeBlockProps = {
  lessonId: string
  exercise: PracticeExercise
  value: string
  builtTokens: string[]
  onPick: (id: string, value: string) => void
  onAddToken: (lessonId: string, exercise: SentenceBuilderExercise, token: string) => void
  onRemoveToken: (lessonId: string, exerciseId: string, index: number) => void
  onClearTokens: (lessonId: string, exerciseId: string) => void
}

function PracticeBlock({ lessonId, exercise, value, builtTokens, onPick, onAddToken, onRemoveToken, onClearTokens }: PracticeBlockProps) {
  if (exercise.type === 'builder') {
    return (
      <article className="panel">
        <h4><JPText text={exercise.prompt} /></h4>
        <div className="token-bank">
          {exercise.tokens.map((token, idx) => {
            const disabled = countToken(builtTokens, token) >= countToken(exercise.tokens, token)
            return (
              <button key={`${exercise.id}-token-${idx}`} type="button" disabled={disabled} onClick={() => onAddToken(lessonId, exercise, token)}>
                <JPText text={token} />
              </button>
            )
          })}
        </div>
        <div className="token-result">
          {builtTokens.length === 0 ? (
            <p>Нажимай плитки в нужном порядке.</p>
          ) : (
            builtTokens.map((token, idx) => (
              <button key={`${exercise.id}-built-${idx}`} type="button" onClick={() => onRemoveToken(lessonId, exercise.id, idx)}>
                <JPText text={token} />
              </button>
            ))
          )}
        </div>
        <button className="secondary" type="button" onClick={() => onClearTokens(lessonId, exercise.id)}>Очистить</button>
      </article>
    )
  }

  const choice = exercise as ChoiceExercise
  return (
    <article className="panel">
      <h4><JPText text={choice.prompt} /></h4>
      <div className="choice-grid">
        {choice.options.map((option) => (
          <label key={`${choice.id}-${option}`}>
            <input type="radio" name={choice.id} checked={value === option} onChange={() => onPick(choice.id, option)} />
            <span><JPText text={option} /></span>
          </label>
        ))}
      </div>
      <p className="hint">{choice.explanation}</p>
    </article>
  )
}

type ExamQuestionBlockProps = {
  question: ExamQuestion
  value: string
  onChange: (id: string, value: string) => void
}

function ExamQuestionBlock({ question, value, onChange }: ExamQuestionBlockProps) {
  return (
    <article className="panel exam-question">
      <h4><JPText text={question.prompt} /></h4>
      <div className="choice-grid">
        {question.options.map((option) => (
          <label key={`${question.id}-${option}`}>
            <input type="radio" name={question.id} checked={value === option} onChange={() => onChange(question.id, option)} />
            <span><JPText text={option} /></span>
          </label>
        ))}
      </div>
      <p className="hint">{question.explanation}</p>
    </article>
  )
}

export default App
