const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const courseFile = path.join(root, "content", "git-basics", "course.json");
const courseDir = path.dirname(courseFile);
const outputFile = path.join(root, "content-bundle.js");

const course = JSON.parse(fs.readFileSync(courseFile, "utf8"));
const markdownByFile = {};

for (const { lesson } of getLessonEntries(course)) {
  if (!lesson.file) continue;
  markdownByFile[lesson.file] = fs.readFileSync(path.join(courseDir, lesson.file), "utf8");
}

const bundle = `window.LEARNING_CONTENT = ${JSON.stringify({ course, markdownByFile }, null, 2)};\n`;
fs.writeFileSync(outputFile, bundle);
console.log(`Built ${path.relative(root, outputFile)}`);

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
