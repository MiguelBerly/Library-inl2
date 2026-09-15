export const INVALID_ID_ERROR = { error: 'Id must be a positive integer' };

export function parseId(value: string): number | null {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}
