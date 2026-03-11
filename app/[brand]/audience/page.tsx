import AgeBarChart from "../../../components/AgeBarChart";
import GenderDonut from "../../../components/GenderDonut";
import CountriesChart from "../../../components/CountriesChart";
import { getAudienceData } from "../../../lib/instagram";

export default async function AudiencePage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  await params;
  const { age, gender, countries } = getAudienceData();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-semibold text-ink tracking-tight">
          Audience
        </h1>
        <p className="text-ink-muted text-sm mt-1.5">
          Aggregated demographic insights · all athletes
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
            <p className="text-xs text-ink-muted mt-0.5">Combined portfolio audience</p>
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
            <p className="text-xs text-ink-muted mt-0.5">Combined portfolio audience</p>
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
          <p className="text-xs text-ink-muted mt-0.5">Where the audience is located</p>
        </div>
        <div className="max-w-lg">
          <CountriesChart data={countries} />
        </div>
      </div>

      {/* Insight callout */}
      <div className="mt-4 bg-canvas border border-border rounded-2xl p-5">
        <p className="text-xs font-medium text-ink-muted uppercase tracking-[0.1em] mb-1">
          Key Insight
        </p>
        <p className="text-sm text-ink leading-relaxed">
          The core audience is{" "}
          <strong>male (73%), aged 25–44 (57%)</strong>, predominantly based in{" "}
          <strong>Spain (42%) and Argentina (18%)</strong>. This aligns strongly with the
          World Padel Tour&apos;s primary markets. Content in Spanish tends to
          outperform by +1.2pp engagement rate.
        </p>
      </div>
    </div>
  );
}
