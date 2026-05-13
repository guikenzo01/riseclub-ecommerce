export type Review = {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const REVIEW_KEY = "riseclub-reviews";

export function readReviews(): Review[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(REVIEW_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReviews(reviews: Review[]) {
  window.localStorage.setItem(REVIEW_KEY, JSON.stringify(reviews));
  window.dispatchEvent(new Event("riseclub-reviews-updated"));
}

export function getProductReviews(productId: string) {
  return readReviews().filter((review) => review.productId === productId);
}

export function createReview(data: Omit<Review, "id" | "createdAt">) {
  const review: Review = {
    ...data,
    id: `RV-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString()
  };
  saveReviews([review, ...readReviews()]);
  return review;
}

export function getReviewSummary(productId: string, fallbackRating: number) {
  const reviews = getProductReviews(productId);
  if (!reviews.length) {
    return {
      average: fallbackRating,
      count: 0
    };
  }

  const average = reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
  return {
    average,
    count: reviews.length
  };
}
