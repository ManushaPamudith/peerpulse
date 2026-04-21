import api from "./api";

export const getReviews = () => api.get("/reviews/my");
export const createReview = (payload) => api.post("/reviews", payload);
export const getReviewsByUser = (userId) => api.get(`/reviews/user/${userId}`);
export const getReviewsBySession = (sessionId) => api.get(`/reviews/session/${sessionId}`);
