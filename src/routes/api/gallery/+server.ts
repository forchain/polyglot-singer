import { json } from '@sveltejs/kit';
import { db, schema } from '$lib/server/database/connection';
import { eq } from 'drizzle-orm';

export const GET = async () => {
  // 查询所有公开作品，按时间倒序
  const results = await db.select({
    id: schema.analyzedLyrics.id,
    title: schema.analyzedLyrics.title,
    artist: schema.analyzedLyrics.artist,
    userId: schema.analyzedLyrics.userId,
    createdAt: schema.analyzedLyrics.createdAt,
    lyrics: schema.analyzedLyrics.lyrics
  })
    .from(schema.analyzedLyrics)
    .where(eq(schema.analyzedLyrics.isPublic, true))
    .orderBy(schema.analyzedLyrics.createdAt)
    .limit(100);

  // 只返回部分歌词
  const data = results.map((item: any) => ({
    ...item,
    lyrics: item.lyrics?.split('\n').slice(0, 2).join(' / ') || ''
  }));

  return json({ success: true, data });
}; 