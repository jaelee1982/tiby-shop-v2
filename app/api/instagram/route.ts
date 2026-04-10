import { NextResponse } from "next/server";

const META_API = "https://graph.facebook.com/v25.0";
const IG_ACCOUNT_ID = process.env.META_IG_ACCOUNT_ID || "17841480689167872";

export const revalidate = 3600; // cache for 1 hour

export async function GET() {
  const token = process.env.META_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "META_ACCESS_TOKEN not configured" },
      { status: 500 }
    );
  }

  try {
    const url = `${META_API}/${IG_ACCOUNT_ID}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count&limit=8&access_token=${token}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message },
        { status: 400 }
      );
    }

    // Filter to only images and carousels (skip videos without thumbnails)
    const posts = (data.data || []).map(
      (post: {
        id: string;
        caption?: string;
        media_type: string;
        media_url?: string;
        thumbnail_url?: string;
        permalink: string;
        timestamp: string;
        like_count?: number;
      }) => ({
        id: post.id,
        caption: (post.caption || "").substring(0, 100),
        mediaType: post.media_type,
        imageUrl: post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url,
        permalink: post.permalink,
        timestamp: post.timestamp,
        likes: post.like_count || 0,
      })
    );

    return NextResponse.json({ posts });
  } catch (e) {
    return NextResponse.json(
      { error: String(e) },
      { status: 500 }
    );
  }
}
