import AgeBarChart from "../../../components/AgeBarChart";
import GenderDonut from "../../../components/GenderDonut";
import CountriesChart from "../../../components/CountriesChart";
import { fetchAudienceInsights } from "../../../lib/instagram";
import { getAthletes } from "../../../lib/athletes";

export default async function AudiencePage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandId } = await params;
  const athletes = await getAthletes(brandId);
  const athlete = athletes[0];

  const { age, gender, countries, isLive } = await fetchAudienceInsights(athlete);

  // Build dynamic insight callout from actual data
  const topGender = [...gender].sort((a, b) => b.value - a.value)[0];
  const topAgeGroups = [...age].sort((a, b) => b.pct - a.pct).slice(0, 2);
  const topAgeLabel = topAgeGroups.map((a) => a.group).join(" and ");
  const topAgePct = topAgeGroups.reduce((s, a) => s + a.pct, 0);
  const topCountries = countries.filter((c) => c.country !== "Other").slice(0, 2);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-semibold text-ink tracking-tight">
          Audience
        </h1>
        <p className="text-ink-muted text-sm mt-1.5">
          {isLive
            ? "Live demographic insights from Instagram Business API"
            : "Estimated demographic insights · connect a Business account for real data"}
        </p>
      </div>

      {/* Top row: age + gender */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Age */}
        <div
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)" }}
        >
          <div className="mb-5">
            <h2 className="text-base font-semibold text-ink">Age Distribution</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              {isLive ? "Live · follower breakdown by age" : "Combined portfolio audience"}
            </p>
          </div>
          <AgeBarChart data={age} />
        </div>

        {/* Gender */}
        <div
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)" }}
        >
          <div className="mb-5">
            <h2 className="text-base font-semibold text-ink">Gender Breakdown</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              {isLive ? "Live · follower breakdown by gender" : "Combined portfolio audience"}
            </p>
          </div>
          <GenderDonut data={gender} />
        </div>
      </div>

      {/* Countries */}
      <div
        className="bg-surface rounded-2xl p-6"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)" }}
      >
        <div className="mb-6">
          <h2 className="text-base font-semibold text-ink">Top Countries</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            {isLive ? "Live · where followers are located" : "Where the audience is located"}
          </p>
        </div>
        <div className="max-w-lg">
          <CountriesChart data={countries} />
        </div>
      </div>

      {/* Insight callout — dynamic */}
      <div className="mt-4 bg-canvas border border-border rounded-2xl p-5">
        <p className="text-xs font-medium text-ink-muted uppercase tracking-[0.1em] mb-1">
          Key Insight
        </p>
        <p className="text-sm text-ink leading-relaxed">
          The core audience is{" "}
          <strong>
            {topGender.name.toLowerCase()} ({topGender.value}%), aged {topAgeLabel} ({topAgePct}%)
          </strong>
          {topCountries.length >= 2 && (
            <>
              , predominantly based in{" "}
              <strong>
                {topCountries[0].country} ({topCountries[0].pct}%) and{" "}
                {topCountries[1].country} ({topCountries[1].pct}%)
              </strong>
            </>
          )}
          .{" "}
          {!isLive && (
            <span className="text-ink-muted">
              Connect a Business Instagram account to see real audience data.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
