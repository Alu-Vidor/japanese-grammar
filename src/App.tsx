import { Fragment, useMemo, useState, useEffect, type ReactNode } from 'react'
import './App.css'
import { SakuraEffect } from './components/SakuraEffect'
import tokyoCampusBg from './assets/lessons/tokyo_campus_bg.png'
import shibuyaNightBg from './assets/lessons/shibuya_night_bg.png'
import tokyoStationBg from './assets/lessons/tokyo_station_bg.png'
import uenoParkBg from './assets/lessons/ueno_park_bg.png'
import kyotoStreetBg from './assets/lessons/kyoto_street_bg.png'
import asakusaTempleBg from './assets/lessons/asakusa_temple_bg.png'
import aoiAvatar from './assets/characters/avatar_aoi.png'
import kaiAvatar from './assets/characters/avatar_kai.png'
import mameshibaAvatar from './assets/characters/avatar_mameshiba.png'

import {
  N5_GRAMMAR_CHECKLIST,
  finalExam,
  lessonUpgrades,
  lessons,
  type ChoiceExercise,
  type ExamQuestion,
  type Lesson,
  type PracticeExercise,
  type SentenceBuilderExercise,
} from './data'

type LessonScore = { correct: number; total: number; passed: boolean }
type ExamResult = { correct: number; total: number; passed: boolean }

const LESSON_BGS: Record<string, string> = {
  'n5-01': tokyoCampusBg, 'n5-15': tokyoCampusBg,
  'n5-02': shibuyaNightBg, 'n5-07': shibuyaNightBg, 'n5-19': shibuyaNightBg,
  'n5-03': tokyoStationBg, 'n5-04': tokyoStationBg, 'n5-06': tokyoStationBg, 'n5-10': tokyoStationBg, 'n5-11': tokyoStationBg, 'n5-16': tokyoStationBg, 'n5-18': tokyoStationBg, 'n5-20': tokyoStationBg,
  'n5-05': uenoParkBg, 'n5-14': uenoParkBg, 'n5-17': uenoParkBg,
  'n5-09': kyotoStreetBg, 'n5-12': kyotoStreetBg, 'n5-13': kyotoStreetBg,
  'n5-08': asakusaTempleBg,
}

const LESSON_PASS_RATE = 0.75
const EXAM_PASS_RATE = 0.75
const FURIGANA_RE = /\{([^|{}]+)\|([^{}]+)\}/g

const getAvatarForCharacter = (name: string): string | null => {
  if (name.includes('Аой')) return aoiAvatar
  if (name.includes('Кай')) return kaiAvatar
  if (name.includes('Маме-сиба')) return mameshibaAvatar
  return null
}

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
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), 800)
    return () => clearTimeout(timer)
  }, [currentLessonIndex])

  const currentLesson = lessons[currentLessonIndex]
  const currentUpgrade = lessonUpgrades[currentLesson.id]
  const storyModeActive = Boolean(currentLesson.story)
  const nextLesson = lessons[currentLessonIndex + 1] ?? null
  const routeProgress = ((currentLessonIndex + 1) / lessons.length) * 100

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
      <SakuraEffect />
      <header className="hero-block">
        <p className="eyebrow">Japanese Grammar Trainer</p>
        <h1 className="brush-stroke">JLPT N5: атомарный курс грамматики</h1>
        <p className="subtitle">Каждый урок закрывает одну тему, с контекстом реальной Японии и заданиями без ввода текста.</p>
        <div className="header-decoration">
          <ToriiIcon />
        </div>
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
          <div className="sidebar-head">
            <h2 className="brush-stroke">Уроки</h2>
            <FanIcon />
          </div>
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

        <article key={currentLesson.id} className={`content-card ${storyModeActive ? 'story-mode' : ''}`}>
          <div className={`shoji-transition-wrapper ${isTransitioning ? 'animating' : ''}`}>
            <div className="shoji-door left"><span>読み込み中...</span></div>
            <div className="shoji-door right"><span>加载中...</span></div>
          </div>

          <section className="journey-strip panel">
            <div className="journey-head">
              <div>
                <p className="story-stop">Маршрут по Японии</p>
                <h2>{currentLesson.title}</h2>
              </div>
              <p className="journey-progress">Остановка {currentLessonIndex + 1} из {lessons.length}</p>
            </div>
            <div className="route-line" aria-hidden="true">
              <div className="route-fill" style={{ width: `${routeProgress}%` }} />
              <div className="route-dots">
                {lessons.map((lesson, index) => (
                  <span
                    key={lesson.id}
                    className={`route-dot ${index <= currentLessonIndex ? 'passed' : ''} ${lesson.id === currentLesson.id ? 'current' : ''}`}
                  />
                ))}
              </div>
            </div>
            <p className="journey-copy">
              {currentLesson.story
                ? `${currentLesson.story.stopLabel}. ${currentLesson.story.location}`
                : currentLesson.japanContext}
              {nextLesson ? ` Следом: ${nextLesson.title}.` : ' Это финальная остановка маршрута.'}
            </p>
          </section>



          {LESSON_BGS[currentLesson.id] ? (
            <section className="lesson-illustration">
              <img src={LESSON_BGS[currentLesson.id]} alt="Lesson atmosphere" className="animate-fade-in animate-parallax-bg" />
            </section>
          ) : null}

          {currentLesson.story ? (
            <section className="intro-dialogue-panel panel">
              <div className="dialogue-flow">
                <div className="dialogue-entry">
                  {getAvatarForCharacter('Маме-сиба') ? <img src={mameshibaAvatar} alt="Mameshiba" className="character-avatar" /> : null}
                  <div className="grammar-bubble">
                    <p className="explainer-name">Маме-сиба</p>
                    <p><strong>Привет!</strong> Сегодня мы {currentLesson.goal.toLowerCase()}</p>
                  </div>
                </div>
                {currentLesson.hook ? (
                  <div className="dialogue-entry reverse">
                    <div className="grammar-bubble">
                      <p className="explainer-name">Аой</p>
                      <p>{currentLesson.hook}</p>
                    </div>
                    {getAvatarForCharacter('Аой') ? <img src={aoiAvatar} alt="Aoi" className="character-avatar" /> : null}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {currentLesson.story ? (
            <section className="story-panel panel">
              <div className="story-grid">
                <div className="characters-container">
                  <h4>Кто здесь?</h4>
                  <div className="character-list">
                    {currentLesson.story.characters.map((item, idx) => {
                      const avatarSrc = getAvatarForCharacter(item)
                      return (
                        <span key={item} className={`character-chip animate-float delay-${idx % 3}`}>
                          {avatarSrc ? <img src={avatarSrc} alt={item} className="chip-avatar" /> : null}
                          {item}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            </section>
          ) : null}



          <section>
            {currentLesson.dialogues?.grammar ? (
              <div className="dialogue-entry">
                {getAvatarForCharacter(currentLesson.dialogues.grammar.character) ? (
                  <img src={getAvatarForCharacter(currentLesson.dialogues.grammar.character)!} alt={currentLesson.dialogues.grammar.character} className="character-avatar" />
                ) : null}
                <div className="grammar-bubble">
                  <p className="explainer-name">{currentLesson.dialogues.grammar.character}</p>
                  <p>{currentLesson.dialogues.grammar.text}</p>
                </div>
              </div>
            ) : null}
            <div className="grammar-stack">
              {currentLesson.grammar.map((point, idx) => {
                const explainerNames = ['Маме-сиба (маскот курса)', 'Аой (японская подруга)', 'Кай (иностранный студент)']
                const explainerName = explainerNames[idx % explainerNames.length]
                const avatarSrc = getAvatarForCharacter(explainerName)
                return (
                  <div className="dialogue-entry" key={point.title}>
                    {avatarSrc ? <img src={avatarSrc} alt={explainerName.split(' ')[0]} className="character-avatar animate-pulse" /> : null}
                    <div className="panel grammar-bubble">
                      <p className="explainer-name">{explainerName.split(' ')[0]}</p>
                      <h4>{point.title}</h4>
                      <p>{point.rule}</p>
                      <ul>
                        {point.examples.map((example, eIdx) => (
                          <li key={example}>
                            <JPText text={example} />
                            {point.translations?.[eIdx] ? (
                              <details className="translation-spoiler">
                                <summary>Перевод</summary>
                                <p>{point.translations[eIdx]}</p>
                              </details>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section>
            {currentLesson.dialogues?.vocabulary ? (
              <div className="dialogue-entry reverse">
                <div className="grammar-bubble">
                  <p className="explainer-name">{currentLesson.dialogues.vocabulary.character}</p>
                  <p>{currentLesson.dialogues.vocabulary.text}</p>
                </div>
                {getAvatarForCharacter(currentLesson.dialogues.vocabulary.character) ? (
                  <img src={getAvatarForCharacter(currentLesson.dialogues.vocabulary.character)!} alt={currentLesson.dialogues.vocabulary.character} className="character-avatar" />
                ) : null}
              </div>
            ) : null}
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
            {currentLesson.dialogues?.practice ? (
              <div className="dialogue-entry">
                {getAvatarForCharacter(currentLesson.dialogues.practice.character) ? (
                  <img src={getAvatarForCharacter(currentLesson.dialogues.practice.character)!} alt={currentLesson.dialogues.practice.character} className="character-avatar" />
                ) : null}
                <div className="grammar-bubble">
                  <p className="explainer-name">{currentLesson.dialogues.practice.character}</p>
                  <p>{currentLesson.dialogues.practice.text}</p>
                </div>
              </div>
            ) : null}
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
            {currentLesson.dialogues?.cloze ? (
              <div className="dialogue-entry reverse">
                <div className="grammar-bubble">
                  <p className="explainer-name">{currentLesson.dialogues.cloze.character}</p>
                  <p>{currentLesson.dialogues.cloze.text}</p>
                </div>
                {getAvatarForCharacter(currentLesson.dialogues.cloze.character) ? (
                  <img src={getAvatarForCharacter(currentLesson.dialogues.cloze.character)!} alt={currentLesson.dialogues.cloze.character} className="character-avatar" />
                ) : null}
              </div>
            ) : null}
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
              <div className="result-stack">
                <p className={currentScore.passed ? 'result ok' : 'result bad'}>
                  Результат: {currentScore.correct}/{currentScore.total}. Порог: 75%.
                </p>
                {currentScore.passed && currentLesson.story ? (
                  <p className="result ok">Награда: {currentLesson.story.reward}</p>
                ) : null}
                {currentScore.passed && currentLesson.microResult ? (
                  <p className="result ok">{currentLesson.microResult}</p>
                ) : null}
                {currentScore.passed ? (
                  <div className="celebration-card panel">
                    <p className="celebration-label">Финал остановки</p>
                    <h4>{currentLesson.story?.reward ?? 'Новая отметка маршрута'}</h4>
                    <p>
                      {currentUpgrade.finale[0]}
                      {nextLesson ? ` Дальше тебя ждет ${nextLesson.title.toLowerCase()}.` : ' Маршрут завершен на теплой финальной ноте.'}
                    </p>
                  </div>
                ) : null}
              </div>
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

function ToriiIcon() {
  return (
    <svg className="torii-icon animate-float" width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 20 H90 V28 H10 Z" fill="#d35d43" />
      <path d="M15 32 H85 V38 H15 Z" fill="#d35d43" />
      <rect x="25" y="28" width="8" height="60" fill="#d35d43" />
      <rect x="67" y="28" width="8" height="60" fill="#d35d43" />
      <rect x="40" y="38" width="20" height="6" fill="#d35d43" />
    </svg>
  )
}

function FanIcon() {
  return (
    <svg className="fan-icon animate-pulse" width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 80 L20 40 A40 40 0 0 1 80 40 Z" fill="#d35d43" opacity="0.8" />
      <path d="M50 80 L35 45 M50 80 L50 40 M50 80 L65 45" stroke="#fff" strokeWidth="2" />
      <circle cx="50" cy="80" r="3" fill="#3d2b1f" />
    </svg>
  )
}

export default App
