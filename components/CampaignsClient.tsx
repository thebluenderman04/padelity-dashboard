"use client";

import { useState } from "react";
import { Plus, Trash2, TrendingUp, DollarSign, Eye, Users } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ContentMetric {
  id: string;
  impressions: number;
  engagement_count: number;
  post_date: string;
}

interface Deliverable {
  id: string;
  title: string;
  is_contracted: boolean;
  delivered_at: string | null;
}

interface Campaign {
  id: string;
  brand_id: string;
  brand_name: string;
  name: string;
  investment_value: number;
  start_date: string;
  end_date: string;
  contracted_deliverables: number;
  currency: string;
  created_at: string;
  deliverables: Deliverable[];
  content_metrics: ContentMetric[];
}

interface NewCampaign {
  brand_name: string;
  name: string;
  investment_value: string;
  start_date: string;
  end_date: string;
  contracted_deliverables: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const MYR = (n: number) => "MYR " + Math.round(n).toLocaleString("en-MY");
const DEFAULT_CPM = 25;

function calcMetrics(campaign: Campaign) {
  const metrics = campaign.content_metrics ?? [];
  const totalImpressions = metrics.reduce((s, m) => s + (m.impressions ?? 0), 0);
  const totalEngagements = metrics.reduce((s, m) => s + (m.engagement_count ?? 0), 0);
  const emv = (totalImpressions / 1000) * DEFAULT_CPM;
  const investment = campaign.investment_value ?? 0;
  const emvRatio = investment > 0 ? emv / investment : 0;
  const cpi = investment > 0 && totalImpressions > 0 ? investment / totalImpressions : 0;
  const cpe = investment > 0 && totalEngagements > 0 ? investment / totalEngagements : 0;

  // MoM impressions trend
  const byMonth: Record<string, number> = {};
  for (const m of metrics) {
    const month = m.post_date?.slice(0, 7) ?? "unknown";
    byMonth[month] = (byMonth[month] ?? 0) + (m.impressions ?? 0);
  }
  const trend = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, impressions]) => ({ month, impressions }));

  // Organic vs contracted
  const deliverables = campaign.deliverables ?? [];
  const contracted = deliverables.filter((d) => d.is_contracted).length;
  const organic = deliverables.filter((d) => !d.is_contracted).length;

  return { totalImpressions, totalEngagements, emv, emvRatio, cpi, cpe, trend, contracted, organic };
}

// ── Component ──────────────────────────────────────────────────────────────────

const EMPTY: NewCampaign = {
  brand_name: "",
  name: "",
  investment_value: "",
  start_date: "",
  end_date: "",
  contracted_deliverables: "1",
};

export default function CampaignsClient({
  brandId,
  initialCampaigns,
}: {
  brandId: string;
  initialCampaigns: Campaign[];
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewCampaign>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function handleAdd() {
    if (!form.brand_name.trim() || !form.start_date || !form.end_date) return;
    setSaving(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: brandId,
          brand_name: form.brand_name.trim(),
          name: form.name.trim() || `${form.brand_name.trim()} Campaign`,
          investment_value: parseFloat(form.investment_value) || 0,
          start_date: form.start_date,
          end_date: form.end_date,
          contracted_deliverables: parseInt(form.contracted_deliverables) || 1,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setCampaigns((prev) => [{ ...created, deliverables: [], content_metrics: [] }, ...prev]);
        setForm(EMPTY);
        setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/campaigns?id=${id}`, { method: "DELETE" });
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    if (expanded === id) setExpanded(null);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-semibold text-ink tracking-tight">Campaigns</h1>
          <p className="text-ink-muted text-sm mt-1.5">
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} · ROI tracking
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ink text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          <Plus size={15} strokeWidth={2} />
          New Campaign
        </button>
      </div>

      {/* New campaign form */}
      {showForm && (
        <div
          className="bg-surface rounded-2xl p-6 mb-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)" }}
        >
          <h2 className="text-sm font-semibold text-ink mb-4">New Campaign</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Brand Name *">
              <input
                value={form.brand_name}
                onChange={(e) => setForm((f) => ({ ...f, brand_name: e.target.value }))}
                placeholder="e.g. Nike"
                className={inputCls}
              />
            </Field>
            <Field label="Campaign Name">
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Q1 2026 Partnership"
                className={inputCls}
              />
            </Field>
            <Field label="Investment Value (MYR)">
              <input
                type="number"
                min={0}
                value={form.investment_value}
                onChange={(e) => setForm((f) => ({ ...f, investment_value: e.target.value }))}
                placeholder="5000"
                className={inputCls}
              />
            </Field>
            <Field label="Contracted Deliverables">
              <input
                type="number"
                min={1}
                value={form.contracted_deliverables}
                onChange={(e) => setForm((f) => ({ ...f, contracted_deliverables: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Start Date *">
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="End Date *">
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                className={inputCls}
              />
            </Field>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleAdd}
              disabled={saving || !form.brand_name.trim() || !form.start_date || !form.end_date}
              className="px-4 py-2 rounded-xl bg-ink text-white text-sm font-medium hover:bg-zinc-800 disabled:opacity-40 transition-colors"
            >
              {saving ? "Saving…" : "Add Campaign"}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm(EMPTY); }}
              className="px-4 py-2 rounded-xl border border-border text-sm text-ink-muted hover:text-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Campaign list */}
      {campaigns.length === 0 ? (
        <div
          className="bg-surface rounded-2xl p-12 text-center"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <p className="text-ink-muted text-sm">No campaigns yet. Add your first campaign above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const m = calcMetrics(campaign);
            const isExpanded = expanded === campaign.id;

            return (
              <div
                key={campaign.id}
                className="bg-surface rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)" }}
              >
                {/* Campaign header row */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : campaign.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-ink truncate">{campaign.name}</h3>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {campaign.brand_name} · {campaign.start_date} → {campaign.end_date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-semibold text-ink">
                        {MYR(campaign.investment_value)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(campaign.id); }}
                        className="p-1.5 rounded-lg text-ink-subtle hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* KPI strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    <KpiPill icon={<Eye size={12} />} label="EMV" value={MYR(m.emv)} />
                    <KpiPill
                      icon={<TrendingUp size={12} />}
                      label="EMV/Investment"
                      value={m.emvRatio > 0 ? `${m.emvRatio.toFixed(2)}×` : "—"}
                    />
                    <KpiPill
                      icon={<DollarSign size={12} />}
                      label="Cost/Impression"
                      value={m.cpi > 0 ? `MYR ${m.cpi.toFixed(4)}` : "—"}
                    />
                    <KpiPill
                      icon={<Users size={12} />}
                      label="Cost/Engagement"
                      value={m.cpe > 0 ? MYR(m.cpe) : "—"}
                    />
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-border px-6 pb-6 pt-5">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      {/* MoM trend chart */}
                      <div className="xl:col-span-2">
                        <p className="text-xs font-medium text-ink mb-3">Month-on-Month Impressions</p>
                        {m.trend.length > 0 ? (
                          <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={m.trend}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0efec" />
                              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9c9a94" }} />
                              <YAxis tick={{ fontSize: 10, fill: "#9c9a94" }} />
                              <Tooltip
                                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e8e7e3" }}
                                formatter={(v: number) => [v.toLocaleString(), "Impressions"]}
                              />
                              <Line
                                type="monotone"
                                dataKey="impressions"
                                stroke="#0a0a0a"
                                strokeWidth={2}
                                dot={{ r: 3, fill: "#0a0a0a" }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-[180px] flex items-center justify-center text-xs text-ink-subtle bg-canvas rounded-xl">
                            No content metrics linked to this campaign yet
                          </div>
                        )}
                      </div>

                      {/* Organic vs contracted */}
                      <div>
                        <p className="text-xs font-medium text-ink mb-3">Reach Split</p>
                        <div className="space-y-3">
                          <ReachRow
                            label="Contracted"
                            count={m.contracted}
                            total={m.contracted + m.organic}
                            color="bg-ink"
                          />
                          <ReachRow
                            label="Organic"
                            count={m.organic}
                            total={m.contracted + m.organic}
                            color="bg-zinc-300"
                          />
                          {m.contracted + m.organic === 0 && (
                            <p className="text-xs text-ink-subtle">No deliverables linked yet</p>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-border space-y-1.5">
                          <StatRow label="Total Impressions" value={(m.totalImpressions || 0).toLocaleString()} />
                          <StatRow label="Total Engagements" value={(m.totalEngagements || 0).toLocaleString()} />
                          <StatRow label="Contracted Deliverables" value={campaign.contracted_deliverables.toString()} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full h-10 px-3 rounded-xl border border-border bg-canvas text-ink text-sm placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-ink/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-ink-muted uppercase tracking-[0.1em] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function KpiPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-canvas rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-ink-muted mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-[0.08em]">{label}</span>
      </div>
      <p className="text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function ReachRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-ink-muted">{label}</span>
        <span className="text-ink font-medium">{count} ({pct}%)</span>
      </div>
      <div className="w-full h-1.5 bg-canvas rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-ink-muted">{label}</span>
      <span className="text-xs font-medium text-ink">{value}</span>
    </div>
  );
}
