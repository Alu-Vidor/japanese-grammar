import { Fragment, useMemo, useState } from 'react'
import './App.css'
import {
  N5_GRAMMAR_CHECKLIST,
  finalExam,
  lessons,
  type ExamQuestion,
  type Lesson,
  type PracticeExercise,
  type SentenceBuilderExercise,
} from './data'

type LessonScore = {
  correct: number
  total: number
  passed: boolean
}

type ExamResult = {
  correct: number
  total: number
  passed: boolean
}

const LESSON_PASS_RATE = 0.75
const EXAM_PASS_RATE = 0.75
const FURIGANA_RE = /\{([^|{}]+)\|([^{}]+)\}/g

const normalize = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, ' ')

const compareAnswer = (value: string, accepted: string[]): boolean => {
  const normalized = normalize(value)
  return accepted.some((item) => normalize(item) === normalized)
}

const countToken = (items: string[], token: string): number => items.filter((item) => item === token).length
const getBuilderKey = (lessonId: string, exerciseId: string): string => `${lessonId}::${exerciseId}`

function JPText({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
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
  const [practiceInputs, setPracticeInputs] = useState<Record<string, string>>({})
  const [clozeInputs, setClozeInputs] = useState<Record<string, string>>({})
  const [builderDraft, setBuilderDraft] = useState<Record<string, string[]>>({})
  const [lessonScores, setLessonScores] = useState<Record<string, LessonScore>>({})
  const [examInputs, setExamInputs] = useState<Record<string, string>>({})
  const [examResult, setExamResult] = useState<ExamResult | null>(null)

  const currentLesson = lessons[currentLessonIndex]

  const completedLessons = useMemo(
    () => lessons.filter((lesson) => lessonScores[lesson.id]?.passed).length,
    [lessonScores],
  )

  const grammarCoverage = useMemo(() => {
    const covered = new Set(lessons.flatMap((lesson) => lesson.coverage))
    return {
      total: N5_GRAMMAR_CHECKLIST.length,
      covered: N5_GRAMMAR_CHECKLIST.filter((item) => covered.has(item.id)).length,
      missing: N5_GRAMMAR_CHECKLIST.filter((item) => !covered.has(item.id)),
    }
  }, [])

  const isExamUnlocked = completedLessons === lessons.length

  const isLessonUnlocked = (index: number): boolean => {
    if (index === 0) return true
    return Boolean(lessonScores[lessons[index - 1].id]?.passed)
  }

  const getBuiltTokens = (lessonId: string, exerciseId: string): string[] => {
    return builderDraft[getBuilderKey(lessonId, exerciseId)] ?? []
  }

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
        return
      }

      if (exercise.type === 'choice') {
        if (normalize(practiceInputs[exercise.id] ?? '') === normalize(exercise.answer)) correct += 1
        return
      }

      if (compareAnswer(practiceInputs[exercise.id] ?? '', exercise.answer)) correct += 1
    })

    return { correct, total: lesson.practice.length }
  }

  const evaluateCloze = (lesson: Lesson): { correct: number; total: number } => {
    let correct = 0
    lesson.cloze.blanks.forEach((blank) => {
      if (compareAnswer(clozeInputs[blank.id] ?? '', blank.answer)) correct += 1
    })
    return { correct, total: lesson.cloze.blanks.length }
  }

  const checkLesson = (lesson: Lesson): void => {
    const practiceResult = evaluatePractice(lesson)
    const clozeResult = evaluateCloze(lesson)
    const total = practiceResult.total + clozeResult.total
    const correct = practiceResult.correct + clozeResult.correct
    const passed = correct / total >= LESSON_PASS_RATE

    setLessonScores((prev) => ({ ...prev, [lesson.id]: { correct, total, passed } }))
    if (passed && currentLessonIndex < lessons.length - 1) setCurrentLessonIndex((prev) => prev + 1)
  }

  const checkExam = (): void => {
    let correct = 0

    finalExam.forEach((question) => {
      const value = examInputs[question.id] ?? ''
      const ok = question.type === 'choice' ? normalize(value) === normalize(question.answer) : compareAnswer(value, question.answer)
      if (ok) correct += 1
    })

    const total = finalExam.length
    setExamResult({ correct, total, passed: correct / total >= EXAM_PASS_RATE })
  }

  return (
    <main className="app-shell">
      <header className="hero-block">
        <p className="eyebrow">Japanese Grammar Trainer</p>
        <h1>JLPT N5: полный курс по грамматике</h1>
        <p className="subtitle">
          Урок: правило, словарь, разнотипные задания, затем связный текст с пропусками.
        </p>
        <p className="progress">Пройдено уроков: {completedLessons}/{lessons.length}</p>
        <p className="progress">Покрытие грамматики N5: {grammarCoverage.covered}/{grammarCoverage.total}</p>
        {grammarCoverage.missing.length === 0 ? (
          <p className="result ok">Все пункты N5 из чек-листа покрыты в уроках.</p>
        ) : (
          <p className="result bad">
            Не покрыто: {grammarCoverage.missing.map((item) => item.label).join(', ')}
          </p>
        )}
      </header>

      <section className="layout">
        <aside className="sidebar">
          <h2>Темы N5</h2>
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
          </section>

          <section>
            <h3>1) Объяснение правила</h3>
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
            <h3>2) Необходимая лексика</h3>
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
            <h3>3) Практика (разная сложность)</h3>
            <div className="exercise-stack">
              {currentLesson.practice.map((exercise) => (
                <PracticeBlock
                  key={exercise.id}
                  lessonId={currentLesson.id}
                  exercise={exercise}
                  builtTokens={getBuiltTokens(currentLesson.id, exercise.id)}
                  formValue={practiceInputs[exercise.id] ?? ''}
                  onAddToken={addToken}
                  onRemoveToken={removeToken}
                  onClearTokens={clearTokens}
                  onChangeFormValue={(id, value) => setPracticeInputs((prev) => ({ ...prev, [id]: value }))}
                />
              ))}
            </div>
          </section>

          <section>
            <h3>4) Заполни пропуски в тексте</h3>
            <div className="panel cloze-panel">
              <h4>{currentLesson.cloze.title}</h4>
              <p className="cloze-text">
                {currentLesson.cloze.textParts.map((part, index) => (
                  <span key={`${currentLesson.id}-part-${index}`}>
                    <JPText text={part} />
                    {index < currentLesson.cloze.blanks.length ? (
                      <input
                        type="text"
                        value={clozeInputs[currentLesson.cloze.blanks[index].id] ?? ''}
                        placeholder={currentLesson.cloze.blanks[index].placeholder}
                        onChange={(event) =>
                          setClozeInputs((prev) => ({ ...prev, [currentLesson.cloze.blanks[index].id]: event.target.value }))
                        }
                      />
                    ) : null}
                  </span>
                ))}
              </p>
            </div>
          </section>

          <section className="lesson-actions">
            <button type="button" className="primary" onClick={() => checkLesson(currentLesson)}>
              Проверить урок
            </button>
            {lessonScores[currentLesson.id] ? (
              <p className={lessonScores[currentLesson.id].passed ? 'result ok' : 'result bad'}>
                Результат: {lessonScores[currentLesson.id].correct}/{lessonScores[currentLesson.id].total}. Порог: 75%.
              </p>
            ) : (
              <p className="result">Порог прохождения урока: 75%.</p>
            )}
          </section>
        </article>
      </section>

      <section className="exam-section">
        <div className="exam-head">
          <h2>Грамматическая часть JLPT N5</h2>
          <p>Экзамен открыт: <strong>{isExamUnlocked ? 'да' : 'нет'}</strong></p>
        </div>

        <div className={`exam-card ${isExamUnlocked ? '' : 'locked'}`}>
          {!isExamUnlocked ? (
            <p>Сначала заверши все уроки.</p>
          ) : (
            <>
              <div className="exam-grid">
                {finalExam.map((question) => (
                  <ExamQuestionBlock
                    key={question.id}
                    question={question}
                    value={examInputs[question.id] ?? ''}
                    onChange={(id, value) => setExamInputs((prev) => ({ ...prev, [id]: value }))}
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
  builtTokens: string[]
  formValue: string
  onAddToken: (lessonId: string, exercise: SentenceBuilderExercise, token: string) => void
  onRemoveToken: (lessonId: string, exerciseId: string, index: number) => void
  onClearTokens: (lessonId: string, exerciseId: string) => void
  onChangeFormValue: (exerciseId: string, value: string) => void
}

function PracticeBlock({
  lessonId,
  exercise,
  builtTokens,
  formValue,
  onAddToken,
  onRemoveToken,
  onClearTokens,
  onChangeFormValue,
}: PracticeBlockProps) {
  if (exercise.type === 'builder') {
    return (
      <article className="panel">
        <h4><JPText text={exercise.prompt} /></h4>
        <div className="token-bank">
          {exercise.tokens.map((token, idx) => {
            const disabled = countToken(builtTokens, token) >= countToken(exercise.tokens, token)
            return (
              <button type="button" key={`${exercise.id}-token-${idx}`} disabled={disabled} onClick={() => onAddToken(lessonId, exercise, token)}>
                <JPText text={token} />
              </button>
            )
          })}
        </div>
        <div className="token-result">
          {builtTokens.length === 0 ? (
            <p>Нажимай слова по порядку, затем при необходимости убирай лишние.</p>
          ) : (
            builtTokens.map((token, idx) => (
              <button type="button" key={`${exercise.id}-built-${idx}`} onClick={() => onRemoveToken(lessonId, exercise.id, idx)}>
                <JPText text={token} />
              </button>
            ))
          )}
        </div>
        <button type="button" className="secondary" onClick={() => onClearTokens(lessonId, exercise.id)}>Очистить</button>
      </article>
    )
  }

  if (exercise.type === 'choice') {
    return (
      <article className="panel">
        <h4><JPText text={exercise.prompt} /></h4>
        <div className="choice-grid">
          {exercise.options.map((option) => (
            <label key={`${exercise.id}-${option}`}>
              <input
                type="radio"
                name={exercise.id}
                checked={formValue === option}
                onChange={() => onChangeFormValue(exercise.id, option)}
              />
              <span><JPText text={option} /></span>
            </label>
          ))}
        </div>
        <p className="hint">{exercise.explanation}</p>
      </article>
    )
  }

  return (
    <article className="panel">
      <h4><JPText text={exercise.prompt} /></h4>
      <p className="hint"><JPText text={exercise.base} /></p>
      <p>{exercise.instruction}</p>
      <input type="text" value={formValue} onChange={(event) => onChangeFormValue(exercise.id, event.target.value)} placeholder="Введите ответ" />
    </article>
  )
}

type ExamQuestionBlockProps = {
  question: ExamQuestion
  value: string
  onChange: (questionId: string, value: string) => void
}

function ExamQuestionBlock({ question, value, onChange }: ExamQuestionBlockProps) {
  if (question.type === 'choice') {
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

  return (
    <article className="panel exam-question">
      <h4><JPText text={question.prompt} /></h4>
      <input type="text" value={value} onChange={(event) => onChange(question.id, event.target.value)} placeholder="Введите форму" />
      <p className="hint">{question.explanation}</p>
    </article>
  )
}

export default App
