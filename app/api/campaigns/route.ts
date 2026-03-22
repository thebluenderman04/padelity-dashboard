import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";

// GET /api/campaigns?brand_id=padelity
export async function GET(req: NextRequest) {
  const brandId = req.nextUrl.searchParams.get("brand_id");
  if (!brandId) return NextResponse.json({ error: "brand_id required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("campaigns")
    .select(`
      id, brand_id, name, brand_name, investment_value, start_date, end_date,
      contracted_deliverables, currency, created_at,
      deliverables ( id, title, is_contracted, delivered_at ),
      content_metrics ( id, impressions, engagement_count, post_date )
    `)
    .eq("brand_id", brandId)
    .order("start_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/campaigns
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { brand_id, brand_name, name, investment_value, start_date, end_date, contracted_deliverables } = body;

  if (!brand_id || !brand_name || !name || !start_date || !end_date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("campaigns")
    .insert({
      brand_id,
      name: name || `${brand_name} Campaign`,
      brand_name,
      investment_value: investment_value ?? 0,
      start_date,
      end_date,
      contracted_deliverables: contracted_deliverables ?? 1,
      currency: "MYR",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/campaigns?id=<uuid>
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabaseAdmin.from("campaigns").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
