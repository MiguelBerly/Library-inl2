// Removes anything that could be interpreted as HTML. The final step strips every
// remaining angle bracket, so the result can never contain a tag, even if the input
// was built to slip past the earlier patterns.
export function sanitizeText(value: string): string {
    return value
        .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/[<>]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}
