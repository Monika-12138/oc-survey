export const noTargetInterestAnswers = Object.freeze([
  "clear-idea",
  "interested-unsure",
  "thought-no-plan",
  "open-to-learn",
]);

export const firstCharacterQuestionIds = Object.freeze([
  "q1",
  "q1b",
  "q1d",
  "q1e",
  "q1f",
  "q1g",
  "q10",
  "q11",
  "q1h",
]);

export const firstCharacterRequiredAnswerIds = Object.freeze([
  "q1d",
  "q1e",
  "q1f",
  "q1g",
  "q10",
  "q11",
  "q1h",
]);

export function isNoTargetInterestAnswer(value) {
  return typeof value === "string" && noTargetInterestAnswers.includes(value);
}

export function getNoTargetQuestionIds(q1bAnswer) {
  return isNoTargetInterestAnswer(q1bAnswer)
    ? [...firstCharacterQuestionIds]
    : ["q1", "q1b"];
}
