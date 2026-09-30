import { describe, expect, it, vi } from 'vitest';
import { collectImportAssets, restoreImportFiles } from './importAssets';

describe('Git import assets', () => {
  it('restores image bytes before startup, without putting Git objects in the snapshot', async () => {
    const jpeg = Uint8Array.from([255, 216, 0, 255]);
    const files = collectImportAssets({
      'public/img/work.jpg': { data: jpeg },
      '.git/objects/ignored.jpg': { data: jpeg },
      'package.json': { data: new TextEncoder().encode('{}') },
    });
    const mkdir = vi.fn().mockResolvedValue(undefined);
    const writeFile = vi.fn().mockResolvedValue(undefined);

    expect(Object.keys(files)).toEqual(['public/img/work.jpg']);
    await restoreImportFiles({ workdir: '/home/project', fs: { mkdir, writeFile } } as any, files);
    expect(mkdir).toHaveBeenCalledWith('public/img', { recursive: true });
    expect(mkdir.mock.invocationCallOrder[0]).toBeLessThan(writeFile.mock.invocationCallOrder[0]);
    expect([...writeFile.mock.calls[0][1]]).toEqual([...jpeg]);
  });

  it('restores absolute snapshot paths relative to the project', async () => {
    const mkdir = vi.fn().mockResolvedValue(undefined);
    const writeFile = vi.fn().mockResolvedValue(undefined);

    await restoreImportFiles({ workdir: '/home/project', fs: { mkdir, writeFile } } as any, {
      '/home/project/src/App.tsx': { type: 'file', content: 'source', isBinary: false },
    });
    expect(writeFile).toHaveBeenCalledWith('src/App.tsx', 'source');
  });
});
