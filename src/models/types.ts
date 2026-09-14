export type Genre = { id: number; name: string; slug: string };
export type Author = { id: number; name: string; nationality: string };
export type Book = { id: number; title: string; authorId: number; genreId: number; year: number };
export type Database = { genres: Genre[]; authors: Author[]; books: Book[] };
