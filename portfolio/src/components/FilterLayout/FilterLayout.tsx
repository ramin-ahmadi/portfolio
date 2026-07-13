/**
 *
 * Defines the CSS grid position (and dim state) for every card in each
 * nav-filter state. Keys match the slot keys used in App.js.
 *
 * col / row values are passed directly as gridColumn / gridRow CSS properties.
 * dim: true  → card is de-prioritised (rendered at 30 % opacity).
 * dim absent → card is a priority card (full opacity).
 *
 * Layout grid: 4 columns × 252 px, gap 18 px, auto rows 252 px.
 *
 * Row reference (8 rows, 9 for Side Quests):
 *   col notation  '1/3' = cols 1–2 (left half)
 *                 '3/5' = cols 3–4 (right half)
 *                 '1'|'2'|'3'|'4' = single column
 */

/* ── Helper: 2-column grid uses cols 1–2 instead of 1–4 ────────────── */
const MOBILE_BREAKPOINT = 768;

/**
 * Desktop layouts — 4-column grid (252 px fixed columns).
 */
export const LAYOUTS = {
  // ── ALL ──────────────────────────────────────────────────────────────────
  All: {
    AboutCard: { col: "1 / 3", row: "1" },
    GmailCard: { col: "3", row: "1" },
    LinkedinCard: { col: "4", row: "1" },
    BulbCard: { col: "1", row: "2" },
    DuolingoCard: { col: "2", row: "2" },
    ModularSofa: { col: "3 / 5", row: "2 / 4" },
    DesignSystem: { col: "1 / 3", row: "3 / 5" },
    AgenticDesignSystem: { col: "3", row: "4 / 6" },
    Libra: { col: "4 / 5", row: "4 / 6" },
    Quote: { col: "1 / 3", row: "5" },
    QuoteUX: { col: "3 / 5", row: "6" },
    Essity: { col: "1 / 3", row: "6 / 8" },
    Strava: { col: "3", row: "7" },
    Books: { col: "4", row: "7" },
  },

  // ── ABOUT ────────────────────────────────────────────────────────────────

  "About me": {
    AboutCard: { col: "1 / 3", row: "1" },
    GmailCard: { col: "3", row: "1" },
    LinkedinCard: { col: "4", row: "1" },
    BulbCard: { col: "1", row: "2" },
    DuolingoCard: { col: "2", row: "2" },
    Quote: { col: "3/5", row: "2" },
    QuoteUX: { col: "1/3", row: "3" },
    Books: { col: "3", row: "3" },
    Strava: { col: "4", row: "3" },
    ModularSofa: { col: "3 / 5", row: "4/6" , dim: true},
    DesignSystem: { col: "1 / 3", row: "4/6" , dim: true},
    AgenticDesignSystem: { col: "3", row: "6/8" , dim: true},
    Libra: { col: "4", row: "6/8" , dim: true},
    Essity: { col: "1 / 3", row: "6 / 8", dim: true },
  },

  // ── WORK ─────────────────────────────────────────────────────────────────

  Work: {
    ModularSofa: { col: "3 / 5", row: "1/3" },
    DesignSystem: { col: "1 / 3", row: "1/3" },
    AgenticDesignSystem: { col: "3", row: "3 / 5" },
    Libra: { col: "4 / 5", row: "3 / 5" },
    Essity: { col: "1 / 3", row: "3 / 5" },
    AboutCard: { col: "1 / 3", row: "5", dim: true },
    GmailCard: { col: "3", row: "5", dim: true },
    LinkedinCard: { col: "4", row: "5", dim: true },
    BulbCard: { col: "1", row: "6", dim: true },
    DuolingoCard: { col: "2", row: "6", dim: true },
    Quote: { col: "3 / 5", row: "6", dim: true },
    QuoteUX: { col: "1 / 3", row: "7", dim: true },
    Strava: { col: "3", row: "7", dim: true },
    Books: { col: "4", row: "7", dim: true },
  },

  // ── Blog ──────────────────────────────────────────────────────────

  Blog: {
 url:"https://medium.com/@raminahmadi"
  },
};

/**
 * Mobile layouts — 2-column fluid grid (1fr columns).

 */
export const MOBILE_LAYOUTS = {
  // ── ALL (mobile) ────────────────────────────────────────────────────────
  All: {
    AboutCard: { col: "1 / 3", row: "1" },
    GmailCard: { col: "1", row: "2" },
    LinkedinCard: { col: "2", row: "2" },
    BulbCard: { col: "1", row: "3" },
    DuolingoCard: { col: "2", row: "3" },
    ModularSofa: { col: "1 / 3", row: "4 / 6" },
    DesignSystem: { col: "1 / 3", row: "6 / 8" },
    AgenticDesignSystem: { col: "1", row: "8 / 10" },
    Libra: { col: "2", row: "8 / 10" },
    Quote: { col: "1 / 3", row: "10" },
    QuoteUX: { col: "1 / 3", row: "11" },
    Essity: { col: "1 / 3", row: "12 / 14" },
    Strava: { col: "1", row: "14" },
    Books: { col: "2", row: "14" },
  },

  // ── ABOUT (mobile) ──────────────────────────────────────────────────────
  "About me": {
    AboutCard: { col: "1 / 3", row: "1" },
    GmailCard: { col: "1", row: "2" },
    LinkedinCard: { col: "2", row: "2" },
    BulbCard: { col: "1", row: "3" },
    DuolingoCard: { col: "2", row: "3" },
    Quote: { col: "1/3", row: "4" },
    Strava: { col: "1", row: "5" },
    Books: { col: "2", row: "5" },
    QuoteUX: { col: "1/3", row: "6" },
    ModularSofa: { col: "1 /3", row: "7 / 9" , dim: true},
    AgenticDesignSystem: { col: "1", row: "9 / 11", dim: true },
    Libra: { col: "2", row: "9 / 11", dim: true },
    Essity: { col: "1 / 3", row: "11 / 13", dim: true },
    DesignSystem: { col: "1/3 ", row: "13 / 14" , dim: true},
  
  },

  // ── WORK (mobile) ───────────────────────────────────────────────────────

  Work: {
        ModularSofa: { col: "1 /3", row: "1 / 3" },
    AgenticDesignSystem: { col: "1", row: "3 / 5" },
    Libra: { col: "2", row: "3 / 5" },
    Essity: { col: "1 / 3", row: "5 / 7" },
    DesignSystem: { col: "1/3 ", row: "7 / 9" },
    AboutCard: { col: "1 / 3", row: "9" , dim: true},
    GmailCard: { col: "1", row: "10", dim: true },
    LinkedinCard: { col: "2", row: "10", dim: true},
    BulbCard: { col: "1", row: "11" , dim: true},
    DuolingoCard: { col: "2", row: "11" , dim: true},
    Quote: { col: "1/3", row: "12" , dim: true},
    Strava: { col: "1", row: "13", dim: true },
    Books: { col: "2", row: "13" , dim: true},
    QuoteUX: { col: "1/3", row: "14" , dim: true},

  },

  // ── Blog (mobile) ────────────────────────────────────────────────
  Blog: {
 url:"https://medium.com/@raminahmadi"
  },
};

export { MOBILE_BREAKPOINT };
