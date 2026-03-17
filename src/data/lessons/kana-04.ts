import { type Lesson } from '../types'

export const lessonKana04: Lesson = {
  id: 'kana-04',
  title: 'Азбука: Ряды Ма, Я, Ра, Ва, Н',
  goal: 'Завершить изучение базовых 46 знаков хираганы.',
  hook: 'Зайдем в комбини (магазин)? Тут столько всего вкусного, и почти всё подписано знакомыми буквами!',
  microResult: 'Теперь ты знаешь все основные знаки хираганы и можешь читать названия продуктов.',
  coverage: ['hiragana-ma', 'hiragana-ya', 'hiragana-ra', 'hiragana-wa', 'hiragana-n'],
  japanContext: 'Сцена: Кай заходит в круглосуточный магазин (Konbini) купить перекус.',
  story: {
    stopLabel: 'В магазине',
    location: '7-Eleven или Lawson рядом с общежитием',
    scene: 'Кай берет онигири. Маме-сиба объясняет, как читаются остатки азбуки на упаковках.',
    characters: ['Кай', 'Маме-сиба'],
    visuals: ['Упаковка Onigiri', 'Бутылка чая', 'Кассовый аппарат'],
    animations: ['Появление оставшихся знаков', 'Подсветка "ん" в конце слов'],
    reward: 'Бейдж: Покупатель',
  },
  grammar: [
    {
      title: 'Ряды Ma и Ya',
      rule: 'Ma: ま(ma), み(mi), む(mu), め(me), も(mo). Ya: や(ya), ゆ(yu), よ(yo).',
      examples: ['みず (mizu)', 'やま (yama)', 'ゆめ (yume)'],
      translations: ['Вода', 'Гора', 'Мечта'],
    },
    {
      title: 'Ряды Ra, Wa и N',
      rule: 'Ra: ら(ra), り(ri), る(ru), れ(re), ろ(ro). Wa: わ(wa). И единственный согласный без гласного: ん(n).',
      examples: ['そら (sora)', 'わたし (watashi)', 'みかん (mikan)'],
      translations: ['Небо', 'Я', 'Мандарин'],
    },
  ],
  vocabulary: [
    { jp: 'ま', reading: 'ma', ru: 'ма' },
    { jp: 'み', reading: 'mi', ru: 'ми' },
    { jp: 'む', reading: 'mu', ru: 'му' },
    { jp: 'め', reading: 'me', ru: 'ме' },
    { jp: 'も', reading: 'mo', ru: 'мо' },
    { jp: 'や', reading: 'ya', ru: 'я' },
    { jp: 'ゆ', reading: 'yu', ru: 'ю' },
    { jp: 'よ', reading: 'yo', ru: 'ё' },
    { jp: 'ら', reading: 'ra', ru: 'ра' },
    { jp: 'り', reading: 'ri', ru: 'ри' },
    { jp: 'る', reading: 'ru', ru: 'ру' },
    { jp: 'れ', reading: 're', ru: 'ре' },
    { jp: 'ろ', reading: 'ro', ru: 'ро' },
    { jp: 'わ', reading: 'wa', ru: 'ва' },
    { jp: 'ん', reading: 'n', ru: 'н' },
    { jp: 'みず', reading: 'mizu', ru: 'вода' },
    { jp: 'みかん', reading: 'mikan', ru: 'мандарин' },
    { jp: 'わたし', reading: 'watashi', ru: 'я' },
    { jp: 'やま', reading: 'yama', ru: 'гора' },
  ],
  practice: [
    {
      id: 'k4-q1',
      type: 'choice',
      prompt: 'Найди знак "н".',
      options: ['ん', 'わ', 'め', 'れ'],
      answer: 'ん',
      explanation: 'Знак "ん" — единственный согласный, который стоит отдельно.',
    },
    {
      id: 'k4-q2',
      type: 'choice',
      prompt: 'Как читается слово みず?',
      options: ['mizu', 'mazu', 'mozu', 'mezu'],
      answer: 'mizu',
      explanation: 'み (mi) + ず (zu) = mizu (вода).',
    },
    {
      id: 'k4-q3',
      type: 'choice',
      prompt: 'Выберите японский знак "я" (как в слове yama).',
      options: ['や', 'ゆ', 'よ', 'ら'],
      answer: 'や',
      explanation: 'Это слог "я" (ya).',
    },
    {
      id: 'k4-b1',
      type: 'builder',
      prompt: 'Собери слово "Вода" (mizu).',
      tokens: ['み', 'ず', 'ま', 'め'],
      answer: ['み', 'ず'],
    },
    {
      id: 'k4-b2',
      type: 'builder',
      prompt: 'Собери слово "Я" (watashi).',
      tokens: ['わ', 'た', 'し', 'ら'],
      answer: ['わ', 'た', 'し'],
    },
    {
      id: 'k4-b3',
      type: 'builder',
      prompt: 'Собери слово "Мандарин" (mikan).',
      tokens: ['み', 'か', 'ん', 'わ'],
      answer: ['み', 'か', 'ん'],
    },
  ],
  cloze: {
    title: 'В комбини',
    textParts: [
      'Кай берет бутылку ',
      ' (mizu, вода) и пакет ',
      ' (mikan, мандарины). Маме-сиба говорит: "Смотри, это ряд ',
      '!"',
    ],
    blanks: [
      { id: 'k4-t1', options: ['みず', 'おちゃ', 'さけ'], answer: 'みず' },
      { id: 'k4-t2', options: ['みかん', 'あめ', 'ぱん'], answer: 'みかん' },
      { id: 'k4-t3', options: ['ma', 'ra', 'wa'], answer: 'ma' },
    ],
  },
    dialogues: {
          grammar: {
            character: "Кай",
            text: "Переходим к катакане! Она угловатая и используется для иностранных слов."
          },
          vocabulary: {
            character: "Аой",
            text: "Кофе, отель... Заимствованные слова мы пишем именно так!"
          },
          practice: {
            character: "Маме-сиба",
            text: "Сможешь отличить катакану от хираганы?"
          },
          cloze: {
            character: "Аой",
            text: "Как бы ты прочитал это английское слово по-японски?"
          }
        }
}
