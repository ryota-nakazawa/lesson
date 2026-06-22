---
name: lesson-quiz-maker
description: Create or update Japanese learning-lesson comprehension quizzes. Use when Codex needs to add a 理解度チェック/check test to lesson Markdown, especially for this learning-content site, with answer choices, explanations, varied correct-answer positions, and validation-friendly formatting.
---

# Lesson Quiz Maker

Create concise comprehension checks for Japanese lesson content.

## Workflow

1. Read the target lesson content first.
2. Identify 3-5 concepts the learner should be able to explain or distinguish after reading.
3. Add a `## 理解度チェック` section near the end of the lesson unless one already exists.
4. Write multiple-choice questions with four choices labeled `A` to `D`.
5. Add a short `解説:` after each question.
6. Add an `答え:` block at the end.
7. Run the repository's content validation/build steps when the lesson belongs to a generated learning site.

## Quiz Style

- Prefer 4 questions for a normal lesson.
- Ask about the lesson's core mental models, not trivia.
- Use beginner-friendly Japanese.
- Keep distractors plausible but clearly wrong from the lesson text.
- Vary correct-answer positions across questions. Avoid patterns such as all `A`.
- Do not introduce concepts that the lesson has not explained yet.
- Match terminology exactly when the lesson uses specific command names, states, or labels.
- Keep explanations to one or two sentences.

## Format

Use this structure:

```markdown
## 理解度チェック

Q1. 質問文

- A. 選択肢
- B. 選択肢
- C. 選択肢
- D. 選択肢

解説: 解説文。

Q2. 質問文

- A. 選択肢
- B. 選択肢
- C. 選択肢
- D. 選択肢

解説: 解説文。

答え:

- Q1: B
- Q2: D
```

## Quality Check

Before finishing, check:

- The answer key matches the choices.
- Correct answers are distributed across `A` to `D` when possible.
- Each question can be answered from the lesson text alone.
- The quiz reinforces the lesson objective.
- Generated files are rebuilt if the site uses a bundle file.
