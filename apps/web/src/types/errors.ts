export class RateLimitError extends Error {
  constructor() {
    super("Too many requests. Please try again later.");
  }
}
