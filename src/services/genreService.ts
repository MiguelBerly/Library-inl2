import { readDb } from '../db/storage.ts';
import type { Genre } from '../models/types.ts';

export async function listGenres(): Promise<Genre[]> {
    const db = await readDb();
    return db.genres;
}

export async function findGenreBySlug(slug: string): Promise<Genre | undefined> {
    const db = await readDb();
    return db.genres.find((genre) => genre.slug === slug.toLowerCase());
}
