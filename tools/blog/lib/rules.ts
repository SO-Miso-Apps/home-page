/**
 * The written rules of the blog. Gates enforce them and the writer prompt states
 * them, so both read from here — a rule can never drift between the two.
 */

export const MIN_WORDS = 700;
export const MAX_WORDS = 1200;

export const TITLE_MAX_CHARS = 60;
export const SEO_DESCRIPTION_MIN = 140;
export const SEO_DESCRIPTION_MAX = 158;

export const BANNED_PHRASES = [
  "in today's fast-paced",
  "delve",
  "unlock the power",
  "unleash",
  "game-changer",
  "game changer",
  "seamless",
  "elevate your",
  "take it to the next level",
  "revolutionize",
  "it's not just",
  "look no further",
  "tapestry",
  "in the realm of",
  "dive into",
  "supercharge",
  "effortless",
  "cutting-edge",
  "robust solution",
  "when it comes to",
  "the world of",
  "as an ai",
];

/** A number is only allowed in a post when the fact sheet carries the same number. */
export const NUMBER_WITH_UNIT =
  /\b\d[\d,]*(?:\.\d+)?\s?(?:%|(?:products?|variants?|orders?|items?|collections?|customers?|tags?|rules?|seconds?|minutes?|hours?|days?|weeks?|months?|years?|kb|mb|gb|tb)\b)/gi;

export const BACKTICKED_IDENTIFIER = /`([^`]+)`/g;

export const EMOJI = /\p{Extended_Pictographic}/u;
