import CampaignsClient from "../../../components/CampaignsClient";
import { supabaseAdmin } from "../../../lib/supabase";

export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandId } = await params;

  let initialCampaigns: unknown[] = [];
  try {
    const { data } = await supabaseAdmin
      .from("campaigns")
      .select(`
        id, brand_id, name, brand_name, investment_value, start_date, end_date,
        contracted_deliverables, currency, created_at,
        deliverables ( id, title, is_contracted, delivered_at ),
        content_metrics ( id, impressions, engagement_count, post_date )
      `)
      .eq("brand_id", brandId)
      .order("start_date", { ascending: false });

    initialCampaigns = data ?? [];
  } catch {
    // Supabase unavailable — start empty
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <CampaignsClient brandId={brandId} initialCampaigns={initialCampaigns as any} />
  );
}
