const state = {
  course: null,
  activeLesson: null,
  markdownByFile: {},
  activeCategory: "all",
  query: "",
};

const courseTitle = document.querySelector("#courseTitle");
const contentSearch = document.querySelector("#contentSearch");
const categoryFilters = document.querySelector("#categoryFilters");
const lessonNav = document.querySelector("#lessonNav");
const lessonMeta = document.querySelector("#lessonMeta");
const lessonContent = document.querySelector("#lessonContent");
const sidebarResizer = document.querySelector("#sidebarResizer");

const sidebarWidth = {
  min: 240,
  max: 520,
  storageKey: "learningHarnessSidebarWidth",
};

async function init() {
  try {
    if (!window.LEARNING_CONTENT) {
      throw new Error("content-bundle.js is missing. Run: node scripts/build-content-bundle.js");
    }

    state.course = window.LEARNING_CONTENT.course;
    state.markdownByFile = window.LEARNING_CONTENT.markdownByFile;
    courseTitle.textContent = state.course.title;
    initSidebarResize();
    renderCategoryFilters();
    renderNavigation();
    const firstLesson = state.course.stages[0].lessons[0];
    await selectLesson(firstLesson.id);
  } catch (error) {
    lessonContent.innerHTML = `<p class="error">コンテンツを読み込めませんでした。content-bundle.js を生成してください。</p>`;
    console.error(error);
  }
}

function initSidebarResize() {
  const savedValue = localStorage.getItem(sidebarWidth.storageKey);
  const savedWidth = Number(savedValue);
  if (savedValue !== null && Number.isFinite(savedWidth)) {
    setSidebarWidth(savedWidth);
  }

  if (!sidebarResizer) return;

  sidebarResizer.addEventListener("pointerdown", (event) => {
    if (window.matchMedia("(max-width: 820px)").matches) return;
    event.preventDefault();
    sidebarResizer.setPointerCapture(event.pointerId);
    document.body.classList.add("is-resizing-sidebar");
  });

  sidebarResizer.addEventListener("pointermove", (event) => {
    if (!document.body.classList.contains("is-resizing-sidebar")) return;
    const layoutLeft = sidebarResizer.parentElement.getBoundingClientRect().left;
    setSidebarWidth(event.clientX - layoutLeft);
  });

  sidebarResizer.addEventListener("pointerup", (event) => {
    sidebarResizer.releasePointerCapture(event.pointerId);
    document.body.classList.remove("is-resizing-sidebar");
    localStorage.setItem(sidebarWidth.storageKey, getSidebarWidth());
  });

  sidebarResizer.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowLeft" ? -20 : 20;
    setSidebarWidth(Number(getSidebarWidth()) + delta);
    localStorage.setItem(sidebarWidth.storageKey, getSidebarWidth());
  });
}

function setSidebarWidth(width) {
  const clampedWidth = Math.min(sidebarWidth.max, Math.max(sidebarWidth.min, Math.round(width)));
  document.documentElement.style.setProperty("--sidebar-width", `${clampedWidth}px`);
}

function getSidebarWidth() {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--sidebar-width");
  return String(parseInt(value, 10) || 320);
}

contentSearch?.addEventListener("input", (event) => {
  state.query = event.target.value.trim().toLowerCase();
  renderNavigation();
});

function renderCategoryFilters() {
  categoryFilters.innerHTML = "";

  const filters = [
    { id: "all", label: "すべて" },
    ...state.course.stages.map((stage) => ({ id: stage.id ?? stage.title, label: stage.title })),
  ];

  filters.forEach((filter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-button";
    button.dataset.categoryId = filter.id;
    button.textContent = filter.label;
    button.setAttribute("aria-pressed", String(filter.id === state.activeCategory));
    button.addEventListener("click", () => {
      state.activeCategory = filter.id;
      renderCategoryFilters();
      renderNavigation();
    });
    categoryFilters.append(button);
  });
}

function renderNavigation() {
  lessonNav.innerHTML = "";
  let visibleCount = 0;

  state.course.stages.forEach((stage) => {
    const stageId = stage.id ?? stage.title;
    if (state.activeCategory !== "all" && state.activeCategory !== stageId) return;

    const visibleLessons = stage.lessons.filter((lesson) => matchesSearch(lesson));
    if (visibleLessons.length === 0) return;

    const stageEl = document.createElement("section");
    stageEl.className = "stage";

    const title = document.createElement("h2");
    title.className = "stage-title";
    title.textContent = stage.title;
    stageEl.append(title);

    visibleLessons.forEach((lesson) => {
      visibleCount += 1;
      const button = document.createElement("button");
      button.className = "lesson-button";
      button.type = "button";
      button.dataset.lessonId = lesson.id;
      button.innerHTML = `
        <span class="lesson-number">${lesson.number}</span>
        <span>
          <span class="lesson-title">${escapeHtml(lesson.title)}</span>
          <span class="lesson-duration">${escapeHtml(lesson.duration)}</span>
        </span>
      `;
      button.addEventListener("click", () => selectLesson(lesson.id));
      stageEl.append(button);
    });

    lessonNav.append(stageEl);
  });

  if (visibleCount === 0) {
    lessonNav.innerHTML = '<p class="empty-state">該当するコンテンツがありません。</p>';
  }
}

async function selectLesson(id) {
  const lesson = findLesson(id);
  if (!lesson) return;

  state.activeLesson = lesson;
  document.querySelectorAll(".lesson-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lessonId === id);
  });

  lessonMeta.textContent = `${getStageTitle(lesson.id)} / ${lesson.duration} / ${lesson.author} / 更新日 ${lesson.updatedAt}`;
  lessonContent.innerHTML = "<h1>読み込み中</h1>";

  const markdown = state.markdownByFile[lesson.file];
  if (!markdown) {
    lessonContent.innerHTML = `<p class="error">Markdownが見つかりません: ${escapeHtml(lesson.file)}</p>`;
    return;
  }
  lessonContent.innerHTML = markdownToHtml(markdown) + lessonFooterToHtml(lesson);
  initQuizzes();
  initLessonFooter();
}

function findLesson(id) {
  return state.course.stages.flatMap((stage) => stage.lessons).find((lesson) => lesson.id === id);
}

function getStageTitle(lessonId) {
  const stage = state.course.stages.find((candidate) => {
    return candidate.lessons.some((lesson) => lesson.id === lessonId);
  });
  return stage?.title ?? "未分類";
}

function matchesSearch(lesson) {
  if (!state.query) return true;
  const markdown = state.markdownByFile[lesson.file] ?? "";
  const haystack = [
    lesson.title,
    lesson.duration,
    lesson.author,
    lesson.updatedAt,
    getStageTitle(lesson.id),
    markdown,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(state.query);
}

function markdownToHtml(markdown) {
  const allLines = markdown.split("\n");
  const quizStartIndex = allLines.findIndex((line) => line.trim() === "## 理解度チェック");
  const lines = quizStartIndex >= 0 ? allLines.slice(0, quizStartIndex) : allLines;
  const quizLines = quizStartIndex >= 0 ? allLines.slice(quizStartIndex) : [];
  let html = "";
  let inList = false;
  let inCallout = false;
  let inCode = false;
  let codeLines = [];
  let tableLines = [];

  const closeList = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };

  const closeCallout = () => {
    if (inCallout) {
      html += "</div>";
      inCallout = false;
    }
  };

  const closeCode = () => {
    if (inCode) {
      html += `<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`;
      inCode = false;
      codeLines = [];
    }
  };

  const closeTable = () => {
    if (tableLines.length > 0) {
      html += markdownTableToHtml(tableLines);
      tableLines = [];
    }
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (line.startsWith("```")) {
      if (inCode) {
        closeCode();
      } else {
        closeList();
        closeCallout();
        closeTable();
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeLines.push(rawLine);
      return;
    }

    if (!line) {
      closeList();
      closeTable();
      return;
    }

    if (isTableLine(line)) {
      closeList();
      closeCallout();
      tableLines.push(line);
      return;
    }

    closeTable();

    if (line.startsWith("> ")) {
      closeList();
      if (!inCallout) {
        html += '<div class="callout">';
        inCallout = true;
      }
      html += `<p>${inlineMarkdown(line.slice(2))}</p>`;
      return;
    }

    closeCallout();

    if (line.startsWith("# ")) {
      closeList();
      html += `<h1>${inlineMarkdown(line.slice(2))}</h1>`;
    } else if (line.startsWith("## ")) {
      closeList();
      html += `<h2>${inlineMarkdown(line.slice(3))}</h2>`;
    } else if (line.startsWith("### ")) {
      closeList();
      html += `<h3>${inlineMarkdown(line.slice(4))}</h3>`;
    } else if (/^!\[[^\]]*]\([^)]+\)$/.test(line)) {
      closeList();
      const image = parseMarkdownImage(line);
      html += `<figure><img src="${image.src}" alt="${image.alt}" loading="lazy" /><figcaption>${image.alt}</figcaption></figure>`;
    } else if (line.startsWith("- ")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${inlineMarkdown(line.slice(2))}</li>`;
    } else {
      closeList();
      html += `<p>${inlineMarkdown(line)}</p>`;
    }
  });

  closeList();
  closeCallout();
  closeCode();
  closeTable();
  if (quizLines.length > 0) {
    html += quizToHtml(quizLines);
  }
  return html;
}

function quizToHtml(lines) {
  const quiz = parseQuiz(lines);
  if (quiz.questions.length === 0) return "<h2>理解度チェック</h2>";

  const passCount = Math.max(1, Math.ceil(quiz.questions.length * 0.7));
  const questionsHtml = quiz.questions
    .map((question, index) => {
      const optionsHtml = question.options
        .map((option) => {
          return `
            <button class="quiz-option" type="button" data-option="${escapeHtml(option.key)}">
              <span class="quiz-radio" aria-hidden="true"></span>
              <span>${inlineMarkdown(option.text)}</span>
            </button>
          `;
        })
        .join("");

      return `
        <section class="quiz-question" data-answer="${escapeHtml(question.answer)}">
          <div class="quiz-question-head">
            <span class="quiz-number">${index + 1}</span>
            <h3>${inlineMarkdown(question.prompt)}</h3>
            <span class="quiz-status" aria-live="polite"></span>
          </div>
          <div class="quiz-options">${optionsHtml}</div>
          <div class="quiz-explanation">
            <strong>解説</strong>
            <p>${inlineMarkdown(question.explanation || "本文の内容をもう一度確認しましょう。")}</p>
          </div>
        </section>
      `;
    })
    .join("");

  return `
    <section class="quiz-card" data-pass-count="${passCount}">
      <div class="quiz-card-head">
        <div>
          <h2>理解度チェック（${quiz.questions.length}問）</h2>
          <span class="quiz-headline"></span>
        </div>
        <p>${passCount}問以上で合格</p>
      </div>
      ${questionsHtml}
      <div class="quiz-result" aria-live="polite">
        <div>
          <strong class="quiz-score">未回答</strong>
          <p class="quiz-result-message">選択肢を選ぶと結果が表示されます。</p>
        </div>
        <button class="quiz-reset" type="button">もう一度</button>
      </div>
    </section>
  `;
}

function parseQuiz(lines) {
  const questions = [];
  const answers = new Map();
  let current = null;
  let readingAnswers = false;

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    const questionMatch = line.match(/^Q(\d+)\.\s*(.+)$/);
    const optionMatch = line.match(/^-\s*([A-D])\.\s*(.+)$/);
    const answerMatch = line.match(/^-\s*Q(\d+):\s*([A-D])$/);
    const explanationMatch = line.match(/^解説:\s*(.+)$/);

    if (line === "答え:") {
      readingAnswers = true;
      current = null;
      return;
    }

    if (answerMatch) {
      answers.set(Number(answerMatch[1]), answerMatch[2]);
      return;
    }

    if (questionMatch && !readingAnswers) {
      current = {
        number: Number(questionMatch[1]),
        prompt: questionMatch[2],
        options: [],
        answer: "",
        explanation: "",
      };
      questions.push(current);
      return;
    }

    if (optionMatch && current) {
      current.options.push({ key: optionMatch[1], text: optionMatch[2] });
      return;
    }

    if (explanationMatch && current) {
      current.explanation = explanationMatch[1];
    }
  });

  questions.forEach((question) => {
    question.answer = answers.get(question.number) ?? "";
  });

  return { questions };
}

function initQuizzes() {
  document.querySelectorAll(".quiz-card").forEach((quiz) => {
    const updateResult = () => {
      const questions = Array.from(quiz.querySelectorAll(".quiz-question"));
      const answered = questions.filter((question) => question.classList.contains("is-answered"));
      const correct = questions.filter((question) => question.classList.contains("is-correct"));
      const score = quiz.querySelector(".quiz-score");
      const message = quiz.querySelector(".quiz-result-message");
      const passCount = Number(quiz.dataset.passCount);

      if (answered.length === 0) {
        score.textContent = "未回答";
        message.textContent = "選択肢を選ぶと結果が表示されます。";
        quiz.classList.remove("is-passed");
        return;
      }

      score.textContent = `${correct.length} / ${questions.length} 正解`;
      if (answered.length < questions.length) {
        message.textContent = "未回答の問題があります。";
        quiz.classList.remove("is-passed");
      } else if (correct.length >= passCount) {
        message.textContent = "合格です。よく確認できています。";
        quiz.classList.add("is-passed");
      } else {
        message.textContent = "もう一度、本文を確認してみましょう。";
        quiz.classList.remove("is-passed");
      }
    };

    quiz.querySelectorAll(".quiz-option").forEach((option) => {
      option.addEventListener("click", () => {
        const question = option.closest(".quiz-question");
        const answer = question.dataset.answer;
        const selected = option.dataset.option;
        const isCorrect = selected === answer;

        question.classList.add("is-answered");
        question.classList.toggle("is-correct", isCorrect);
        question.classList.toggle("is-incorrect", !isCorrect);
        question.querySelector(".quiz-status").textContent = isCorrect ? "✓ 正解" : "もう一度確認";

        question.querySelectorAll(".quiz-option").forEach((candidate) => {
          const isAnswer = candidate.dataset.option === answer;
          candidate.classList.toggle("is-selected", candidate === option);
          candidate.classList.toggle("is-answer", isAnswer);
          candidate.classList.toggle("is-wrong", candidate === option && !isCorrect);
        });

        updateResult();
      });
    });

    quiz.querySelector(".quiz-reset")?.addEventListener("click", () => {
      quiz.querySelectorAll(".quiz-question").forEach((question) => {
        question.classList.remove("is-answered", "is-correct", "is-incorrect");
        question.querySelector(".quiz-status").textContent = "";
        question.querySelectorAll(".quiz-option").forEach((option) => {
          option.classList.remove("is-selected", "is-answer", "is-wrong");
        });
      });
      updateResult();
    });
  });
}

function lessonFooterToHtml(lesson) {
  const nextLesson = getNextLesson(lesson.id);
  if (!nextLesson) return "";
  return `
    <div class="lesson-footer">
      <button class="next-lesson-button" type="button" data-next-lesson-id="${escapeHtml(nextLesson.id)}">
        次のレッスン →
      </button>
    </div>
  `;
}

function initLessonFooter() {
  document.querySelector(".next-lesson-button")?.addEventListener("click", (event) => {
    selectLesson(event.currentTarget.dataset.nextLessonId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function getNextLesson(id) {
  const lessons = state.course.stages.flatMap((stage) => stage.lessons);
  const index = lessons.findIndex((lesson) => lesson.id === id);
  return index >= 0 ? lessons[index + 1] : null;
}

function isTableLine(line) {
  return line.startsWith("|") && line.endsWith("|") && line.includes("|");
}

function markdownTableToHtml(lines) {
  if (lines.length < 2 || !isTableSeparator(lines[1])) {
    return lines.map((line) => `<p>${inlineMarkdown(line)}</p>`).join("");
  }

  const headers = splitTableRow(lines[0]);
  const rows = lines.slice(2).filter((line) => isTableLine(line)).map(splitTableRow);

  const headerHtml = headers.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("");
  const rowsHtml = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`)
    .join("");

  return `<div class="table-wrap"><table><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table></div>`;
}

function isTableSeparator(line) {
  return splitTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function splitTableRow(line) {
  return line
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

function parseMarkdownImage(line) {
  const match = line.match(/^!\[([^\]]*)]\(([^)]+)\)$/);
  const rawSrc = match?.[2] ?? "";
  return {
    alt: escapeHtml(match?.[1] ?? ""),
    src: escapeHtml(resolveImageSrc(rawSrc)),
  };
}

function resolveImageSrc(src) {
  if (/^(https?:|data:|\/|\.\/|content\/)/.test(src)) return src;
  return `content/git-basics/${src}`;
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

init();
