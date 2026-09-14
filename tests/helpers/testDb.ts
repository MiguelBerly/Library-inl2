import { beforeEach, afterEach } from 'vitest';
import { copyFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const FIXTURE = path.resolve('tests', 'fixtures', 'db.json');

export function useTestDb(): void {
    let dir: string;

    beforeEach(async () => {
        dir = await mkdtemp(path.join(tmpdir(), 'library-test-'));
        process.env.DB_PATH = path.join(dir, 'db.json');
        await copyFile(FIXTURE, process.env.DB_PATH);
    });

    afterEach(async () => {
        await rm(dir, { recursive: true, force: true });
        delete process.env.DB_PATH;
    });
}
