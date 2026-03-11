/**
 * Padelity Analytics — Brand Configuration
 *
 * Add brands as keys. Each brand has a password and a list of athletes.
 * Set athlete `token` to "mock" (or leave empty) to use generated demo data.
 *
 * Instagram scopes needed per token (Basic Display API):
 *   instagram_basic
 *
 * For audience insights (age/gender/country), a Business/Creator account
 * with instagram_manage_insights scope is required.
 */

const brands = {
  padelity: {
    name: "Padelity",
    password: "demo",
    athletes: [
      {
        id: "athlete1",
        name: "Aidan Yunus",
        instagram_handle: "@aidan.yunus",
        token: process.env.IG_TOKEN_AIDAN_YUNUS ?? "mock",
        ig_user_id: "26323269267310530",
      },
    ],
  },
};

module.exports = { brands };
