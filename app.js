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

async function init() {
  try {
    if (!window.LEARNING_CONTENT) {
      throw new Error("content-bundle.js is missing. Run: node scripts/build-content-bundle.js");
    }

    state.course = window.LEARNING_CONTENT.course;
    state.markdownByFile = window.LEARNING_CONTENT.markdownByFile;
    courseTitle.textContent = state.course.title;
    renderCategoryFilters();
    renderNavigation();
    const firstLesson = state.course.stages[0].lessons[0];
    await selectLesson(firstLesson.id);
  } catch (error) {
    lessonContent.innerHTML = `<p class="error">コンテンツを読み込めませんでした。content-bundle.js を生成してください。</p>`;
    console.error(error);
  }
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
  lessonContent.innerHTML = markdownToHtml(markdown);
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
  const lines = markdown.split("\n");
  let html = "";
  let inList = false;
  let inCallout = false;
  let inCode = false;
  let codeLines = [];

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

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (line.startsWith("```")) {
      if (inCode) {
        closeCode();
      } else {
        closeList();
        closeCallout();
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
      return;
    }

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
  return html;
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
