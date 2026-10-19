export function getExamAccess(exam, result) {
  const config = exam?.config ?? exam ?? {};
  const isSuspended = result?.isSuspended === true;
  const isPendingViolation = isSuspended && !result?.report;
  const isCancelled = result?.report?.penalty === 'Hủy toàn bộ kết quả bài thi';
  const scorePublished = result?.scorePublished ?? exam?.scorePublished ?? config.showScoreImmediately ?? false;
  const canShowScore = Boolean(result && scorePublished && !isPendingViolation && Number.isFinite(result.score));
  const canReview = Boolean(result && !isPendingViolation && !isCancelled
    && (config.allowReview ?? exam?.canReview ?? false) && exam?.canReview !== false);
  return { isSuspended, isPendingViolation, canShowScore, canReview, canShowDetails: canShowScore && canReview };
}
