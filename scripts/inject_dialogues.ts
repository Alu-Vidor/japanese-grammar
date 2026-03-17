import { Project, SyntaxKind } from 'ts-morph';

const dialoguesMap: Record<string, Record<string, { character: string, text: string }>> = {
  'kana-01': {
    grammar: { character: 'Маме-сиба', text: 'Посмотри, это основа японского — гласные звуки хираганы!' },
    vocabulary: { character: 'Аой', text: 'Вот первые слова, где встречаются эти гласные. Запоминай!' },
    practice: { character: 'Кай', text: 'Попробуй угадать, как они читаются. Это не так сложно!' },
    cloze: { character: 'Маме-сиба', text: 'А теперь давай соберем короткое слово из этих звуков.' }
  },
  'kana-02': {
    grammar: { character: 'Аой', text: 'Теперь добавим согласные k, s, t, n, h, m, y, r, w. Хирагана становится больше!' },
    vocabulary: { character: 'Кай', text: 'Смотри, сколько новых слов можно собрать теперь!' },
    practice: { character: 'Маме-сиба', text: 'Главное — не путать знаки. Попробуй себя в упражнениях.' },
    cloze: { character: 'Кай', text: 'Снова мини-задание! Прочитаешь это слово?' }
  },
  'kana-03': {
    grammar: { character: 'Кай', text: 'Озвончения и слоги с `я, ю, ё` — просто добавляем кавычки или кружок, и звук меняется!' },
    vocabulary: { character: 'Аой', text: 'Давай посмотрим на слова со звонкими звуками.' },
    practice: { character: 'Маме-сиба', text: 'Держись! Звонкие звуки легко спутать с глухими в тестах.' },
    cloze: { character: 'Кай', text: 'Попробуешь прочитать фразу с дакутэном?' }
  },
  'kana-04': {
    grammar: { character: 'Кай', text: 'Переходим к катакане! Она угловатая и используется для иностранных слов.' },
    vocabulary: { character: 'Аой', text: 'Кофе, отель... Заимствованные слова мы пишем именно так!' },
    practice: { character: 'Маме-сиба', text: 'Сможешь отличить катакану от хираганы?' },
    cloze: { character: 'Аой', text: 'Как бы ты прочитал это английское слово по-японски?' }
  },
  'kana-05': {
    grammar: { character: 'Аой', text: 'Здесь мы разбираем основную таблицу катаканы. Смотри внимательно.' },
    vocabulary: { character: 'Кай', text: 'Эти слова пригодятся тебе в любом японском магазине.' },
    practice: { character: 'Маме-сиба', text: 'Осторожно, некоторые знаки катаканы очень похожи друг на друга!' },
    cloze: { character: 'Кай', text: 'Можешь подставить правильный знак в рекламную вывеску?' }
  },
  'kana-06': {
    grammar: { character: 'Кай', text: 'Удвоенные согласные (маленькое っ) и долгие гласные в катакане — они меняют ритм слова.' },
    vocabulary: { character: 'Маме-сиба', text: 'Слышишь эту паузу перед звуком? Запоминай эти слова.' },
    practice: { character: 'Аой', text: 'Потренируйся ловить ритм удвоений в этих карточках!' },
    cloze: { character: 'Маме-сиба', text: 'Какое слово скрыто здесь? Подумай о долготе.' }
  },
  'n5-01': {
    grammar: { character: 'Аой', text: 'Знакомься, это です (дэсу) — связка, делающая фразу вежливой. Это основа основ!' },
    vocabulary: { character: 'Кай', text: 'Слова для первого разговора. Запоминаем базовые существительные.' },
    practice: { character: 'Маме-сиба', text: 'Давай соберем простую фразу с です. Жми на карточки!' },
    cloze: { character: 'Аой', text: 'Как ты представишься в этой сценке?' }
  },
  'n5-02': {
    grammar: { character: 'Кай', text: 'Чтобы задать вопрос, просто добавь か в конце фразы. Никаких изменений порядка слов!' },
    vocabulary: { character: 'Маме-сиба', text: 'Вопросительные слова и важные термины — вот они.' },
    practice: { character: 'Аой', text: 'Попробуй сформировать вопросы. Не забудь частицу на конце!' },
    cloze: { character: 'Кай', text: 'Тебя о чем-то спрашивают в уличном диалоге. Дополни вопрос.' }
  },
  'n5-03': {
    grammar: { character: 'Маме-сиба', text: 'Отрицание: вместо です мы говорим じゃありません (дзяаримасэн). Звучит громоздко, но важно.' },
    vocabulary: { character: 'Аой', text: 'Слова, которые помогут тебе возразить или уточнить факты.' },
    practice: { character: 'Кай', text: 'Потренируйся ставить существительные в отрицательную форму.' },
    cloze: { character: 'Аой', text: 'В этой сценке тебе нужно извиниться и сказать, что это не так.' }
  },
  'n5-04': {
    grammar: { character: 'Кай', text: 'Частица も означает «тоже» и заменяет частицу は. Очень удобно!' },
    vocabulary: { character: 'Аой', text: 'Полезная лексика для сравнений и согласий.' },
    practice: { character: 'Маме-сиба', text: 'Вставь も туда, где нужно сказать «я тоже».' },
    cloze: { character: 'Кай', text: 'Твой друг заказал то же самое. Как он это скажет?' }
  },
  'n5-05': {
    grammar: { character: 'Аой', text: 'Частицу は (ва) мы используем, чтобы отметить тему предложения. Главное — это произношение!' },
    vocabulary: { character: 'Кай', text: 'Слова для описания людей и профессий.' },
    practice: { character: 'Маме-сиба', text: 'Определи тему предложения и выбери правильную частицу.' },
    cloze: { character: 'Аой', text: 'Оформи тему предложения в разговоре с сенсеем.' }
  },
  'n5-06': {
    grammar: { character: 'Кай', text: 'Это, то, вон то... Указательные местоимения これ, それ, あれ заменяют существительные.' },
    vocabulary: { character: 'Аой', text: 'Все предметы, что можно найти в классе или офисе.' },
    practice: { character: 'Маме-сиба', text: 'Выбери правильное местоимение в зависимости от удаленности!' },
    cloze: { character: 'Кай', text: 'Собери диалог с указанием на предметы вокруг.' }
  },
  'n5-07': {
    grammar: { character: 'Аой', text: 'С それ мы указываем на то, что находится ближе к собеседнику.' },
    vocabulary: { character: 'Кай', text: 'Вещи, которые могут быть в руках у другого человека.' },
    practice: { character: 'Маме-сиба', text: 'Твой собеседник держит предмет. Какое слово использовать?' },
    cloze: { character: 'Кай', text: 'Попроси собеседника показать, что у него в руках.' }
  },
  'n5-08': {
    grammar: { character: 'Кай', text: 'А вот あれ — это предмет, который далеко и от тебя, и от собеседника.' },
    vocabulary: { character: 'Аой', text: 'Объекты на улице и вдалеке.' },
    practice: { character: 'Маме-сиба', text: 'Укажи на здание вдалеке с помощью あれ.' },
    cloze: { character: 'Кай', text: 'Взгляните туда! Что прозвучит в мини-сцене?' }
  },
  'n5-09': {
    grammar: { character: 'Аой', text: 'Теперь объединим местоимения и тему: これ/それ/あれ は... Так мы строим полные фразы!' },
    vocabulary: { character: 'Кай', text: 'Собираем словарный запас для описания предметов.' },
    practice: { character: 'Маме-сиба', text: 'Сложи полные предложения с указанием на вещь.' },
    cloze: { character: 'Аой', text: 'Дополни рассказ о вещах в магазине.' }
  },
  'n5-10': {
    grammar: { character: 'Кай', text: 'Частица の объединяет, но если мы говорим 이... то есть この, то используем перед существительным!' },
    vocabulary: { character: 'Аой', text: 'Новые слова, к которым мы подставим この.' },
    practice: { character: 'Маме-сиба', text: 'Составь сочетание この + существительное.' },
    cloze: { character: 'Кай', text: 'Спроси о книге, которая лежит перед тобой.' }
  },
  'n5-11': {
    grammar: { character: 'Аой', text: 'То же самое с その: используем его только перед существительным у собеседника.' },
    vocabulary: { character: 'Кай', text: 'Слова, обозначающие вещи твоего товарища.' },
    practice: { character: 'Маме-сиба', text: 'Собери фразу про вещь в руках у друга.' },
    cloze: { character: 'Аой', text: 'Как Кай попросит у Аой её ручку?' }
  },
  'n5-12': {
    grammar: { character: 'Кай', text: 'Давай разберем, как устроены реплики с あの!' },
    vocabulary: { character: 'Аой', text: 'А вот слова для удаленных объектов, которые обязательно стоит запомнить!' },
    practice: { character: 'Маме-сиба', text: 'Время тренировки! Вспомни про あの и покажи на удаленное здание.' },
    cloze: { character: 'Кай', text: 'Почти всё! Теперь давай посмотрим, как это звучит вживую в нашей мини-сцене на улице.' }
  },
  'n5-13': {
    grammar: { character: 'Маме-сиба', text: 'Частица どれ? Спрашиваем «какой из?» среди нескольких предметов.' },
    vocabulary: { character: 'Аой', text: 'Слова из ассортимента магазина.' },
    practice: { character: 'Кай', text: 'Задай вопрос продавцу с помощью どれ.' },
    cloze: { character: 'Маме-сиба', text: 'Твой друг не может выбрать. Какой вопрос он задаст?' }
  },
  'n5-14': {
    grammar: { character: 'Аой', text: 'Чтобы спросить «какая именно (сумка)», используем どの перед словом.' },
    vocabulary: { character: 'Кай', text: 'Цвета и прилагательные для выбора предметов.' },
    practice: { character: 'Маме-сиба', text: 'Составь фразы для выбора из нескольких вещей.' },
    cloze: { character: 'Аой', text: 'Нам надо уточнить, какой поезд наш.' }
  },
  'n5-15': {
    grammar: { character: 'Кай', text: 'Переходим к местам! ここ — это место прямо здесь.' },
    vocabulary: { character: 'Аой', text: 'Здания, локации, комнаты.' },
    practice: { character: 'Маме-сиба', text: 'Укажи на место, где вы стоите.' },
    cloze: { character: 'Кай', text: 'Объясни прохожему, что находится здесь.' }
  },
  'n5-16': {
    grammar: { character: 'Аой', text: 'Там, где стоишь ты — это そこ. Место у собеседника.' },
    vocabulary: { character: 'Кай', text: 'Больше локаций для диалогов на расстоянии.' },
    practice: { character: 'Маме-сиба', text: 'Подбери правильное слово для места в паре шагов от тебя.' },
    cloze: { character: 'Аой', text: 'Попроси положить вещь туда, к товарищу.' }
  },
  'n5-17': {
    grammar: { character: 'Кай', text: 'А воооон там вдалеке — это あそこ.' },
    vocabulary: { character: 'Аой', text: 'Горы, парки, далекие станции.' },
    practice: { character: 'Маме-сиба', text: 'Укажи на дальний объект с помощью あそこ.' },
    cloze: { character: 'Кай', text: 'Как сказать о кафе на другом конце улицы?' }
  },
  'n5-18': {
    grammar: { character: 'Аой', text: 'Вопрос どこ означает «где?». Очень важно для туристов!' },
    vocabulary: { character: 'Кай', text: 'Туалет, выход, станция — всё, что ты можешь искать.' },
    practice: { character: 'Маме-сиба', text: 'Попытайся задать вопрос «где находится...»' },
    cloze: { character: 'Аой', text: 'Смоделируем ситуацию в метро. Спроси дорогу.' }
  },
  'n5-19': {
    grammar: { character: 'Кай', text: 'Сложное предложение! 매 – ой... から для причины и が для контраста (но).' },
    vocabulary: { character: 'Аой', text: 'Слова, полезные для объяснения обстоятельств.' },
    practice: { character: 'Маме-сиба', text: 'Соедини две части предложения союзами.' },
    cloze: { character: 'Кай', text: 'Ты опоздал и хочешь объяснить причину.' }
  },
  'n5-20': {
    grammar: { character: 'Аой', text: 'До и после — 〜前に и 〜あとで. Время расставить действия по порядку!' },
    vocabulary: { character: 'Кай', text: 'Глаголы и действия для твоего расписания.' },
    practice: { character: 'Маме-сиба', text: 'Определи хронологию действий и выбери правильную форму.' },
    cloze: { character: 'Аой', text: 'Расскажи о планах на вечер в правильном порядке.' }
  }
};

const defaultDialogue = {
  grammar: { character: 'Кай', text: 'Давайте изучим грамматику этого урока!' },
  vocabulary: { character: 'Аой', text: 'Новые слова всегда полезны, давай прочитаем их.' },
  practice: { character: 'Маме-сиба', text: 'Практика! Собери карточки.' },
  cloze: { character: 'Кай', text: 'Пришло время финальной сцены!' }
};

const project = new Project();
project.addSourceFilesAtPaths('src/data/lessons/*.ts');

for (const sourceFile of project.getSourceFiles()) {
  if (sourceFile.getBaseName() === 'index.ts') continue;
  
  const varDecl = sourceFile.getVariableDeclaration(decl => {
      const typeNode = decl.getTypeNode();
      return typeNode && typeNode.getText().includes('Lesson');
  });
  
  if (varDecl) {
      const init = varDecl.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
      if (!init) continue;
      
      const idProp = init.getProperty('id');
      if (!idProp) continue;
      
      let id = idProp.getText();
      if (id.includes(':')) id = id.split(':')[1].trim();
      id = id.replace(/['"]/g, '');
      
      const targetDialogue = dialoguesMap[id] || defaultDialogue;
      
      const existing = init.getProperty('dialogues');
      if (existing) {
         existing.remove();
      }
      
      init.addPropertyAssignment({
        name: 'dialogues',
        initializer: JSON.stringify(targetDialogue, null, 2).replace(/"([^"]+)":/g, '$1:')
      });
      console.log(`Updated dialogues for ${id}`);
  }
}

project.saveSync();
console.log('All files updated and saved.');
