import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";

// GET /api/brand-tags?brand_id=&ig_user_id=&ig_post_id=
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const brand_id = searchParams.get("brand_id") ?? "";
  const ig_user_id = searchParams.get("ig_user_id") ?? "";
  const ig_post_id = searchParams.get("ig_post_id");

  try {
    let query = supabaseAdmin
      .from("post_brand_tags")
      .select("*")
      .eq("brand_id", brand_id)
      .eq("ig_user_id", ig_user_id);

    if (ig_post_id) {
      query = query.eq("ig_post_id", ig_post_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[brand-tags GET]", error);
      return NextResponse.json({ tags: [] });
    }

    return NextResponse.json({ tags: data ?? [] });
  } catch (err) {
    console.error("[brand-tags GET] exception:", err);
    return NextResponse.json({ tags: [] });
  }
}

// POST /api/brand-tags
// body: { ig_post_id, ig_user_id, brand_id, brand_tag, deal_value?, notes? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ig_post_id, ig_user_id, brand_id, brand_tag, deal_value, notes } = body;

    if (!ig_post_id || !ig_user_id || !brand_id || !brand_tag) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const record: Record<string, unknown> = {
      ig_post_id,
      ig_user_id,
      brand_id,
      brand_tag,
    };

    if (deal_value !== undefined && deal_value !== null && deal_value !== "") {
      record.deal_value = Number(deal_value);
    }
    if (notes !== undefined) {
      record.notes = notes;
    }

    const { data, error } = await supabaseAdmin
      .from("post_brand_tags")
      .upsert(record, { onConflict: "ig_post_id,brand_tag" })
      .select()
      .single();

    if (error) {
      console.error("[brand-tags POST]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tag: data });
  } catch (err) {
    console.error("[brand-tags POST] exception:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// DELETE /api/brand-tags?id=
export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from("post_brand_tags")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[brand-tags DELETE]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[brand-tags DELETE] exception:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
