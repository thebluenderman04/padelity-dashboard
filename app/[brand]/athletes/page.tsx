import AthletesTable from "../../../components/AthletesTable";
import { fetchAthleteData, toAthleteStats } from "../../../lib/instagram";
import { getAthletes } from "../../../lib/athletes";
import { fmt } from "../../../lib/utils";

export default async function AthletesPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandId } = await params;
  const athleteConfigs = await getAthletes(brandId);

  // Fetch stats for all athletes in parallel, attach ig_user_id for profile links
  const athletes = await Promise.all(
    athleteConfigs.map(async (cfg) => {
      const { profile, media } = await fetchAthleteData(cfg);
      return { ...toAthleteStats(cfg, profile, media), ig_user_id: cfg.ig_user_id };
    })
  );

  const totalFollowers = athletes.reduce((s, a) => s + a.followers, 0);
  const avgEngRate =
    athletes.reduce((s, a) => s + a.engagementRate, 0) / athletes.length;
  const totalPostsMonth = athletes.reduce((s, a) => s + a.postsLast30, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-semibold text-ink tracking-tight">
          Athletes
        </h1>
        <p className="text-ink-muted text-sm mt-1.5">
          {athletes.length} athlete{athletes.length !== 1 ? "s" : ""} · click column headers to sort
        </p>
      </div>

      <div
        className="bg-surface rounded-2xl p-6"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)" }}
      >
        <AthletesTable athletes={athletes} brandId={brandId} />
      </div>

      {/* Summary strip */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Athletes", value: athletes.length.toString() },
          { label: "Combined Followers", value: fmt(totalFollowers) },
          { label: "Avg. Eng. Rate", value: `${avgEngRate.toFixed(2)}%` },
          { label: "Posts This Month", value: totalPostsMonth.toString() },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-surface rounded-xl p-4 text-center"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <p className="text-[11px] text-ink-muted uppercase tracking-[0.1em] mb-1">
              {label}
            </p>
            <p className="text-xl font-display font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
