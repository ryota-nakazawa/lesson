const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const courseFile = path.join(root, "content", "git-basics", "course.json");
const courseDir = path.dirname(courseFile);

const errors = [];
const course = JSON.parse(fs.readFileSync(courseFile, "utf8"));
const seenIds = new Set();

for (const { stage, section, lesson } of getLessonEntries(course)) {
  if (!lesson.id) errors.push(`Missing lesson id in "${stage.title} / ${section.title}"`);
  if (seenIds.has(lesson.id)) errors.push(`Duplicate lesson id: ${lesson.id}`);
  seenIds.add(lesson.id);

  if (!lesson.title) errors.push(`Missing title for lesson: ${lesson.id}`);
  if (!lesson.file) errors.push(`Missing file for lesson: ${lesson.id}`);

  const lessonFile = path.join(courseDir, lesson.file ?? "");
  if (!fs.existsSync(lessonFile)) {
    errors.push(`Markdown file not found: ${path.relative(root, lessonFile)}`);
    continue;
  }

  const markdown = fs.readFileSync(lessonFile, "utf8");
  if (!markdown.trim().startsWith("# ")) {
    errors.push(`Markdown must start with H1: ${path.relative(root, lessonFile)}`);
  }

  const imageMatches = markdown.matchAll(/!\[[^\]]*]\(([^)]+)\)/g);
  for (const match of imageMatches) {
    const src = match[1];
    if (/^(https?:|data:|\/|\.\/|content\/)/.test(src)) continue;

    const imageFile = path.join(courseDir, src);
    if (!fs.existsSync(imageFile)) {
      errors.push(`Image file not found: ${path.relative(root, imageFile)}`);
    }
  }
}

if (errors.length > 0) {
  console.error("Content validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Content validation passed: ${seenIds.size} lessons`);

function getStageSections(stage) {
  if (Array.isArray(stage.sections)) return stage.sections;
  return [{ id: `${stage.id ?? stage.title}-default`, title: "", lessons: stage.lessons ?? [] }];
}

function getLessonEntries(course) {
  return (course.stages ?? []).flatMap((stage) => {
    return getStageSections(stage).flatMap((section) => {
      return (section.lessons ?? []).map((lesson) => ({ stage, section, lesson }));
    });
  });
}
