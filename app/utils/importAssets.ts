import { Buffer } from 'node:buffer';
import type { WebContainer } from '@webcontainer/api';
import type { FileMap } from '~/lib/stores/files';

const ASSET_EXTENSION = /\.(jpe?g|png|gif|webp|avif|ico|woff2?|ttf|otf|pdf|mp[34])$/i;

export function collectImportAssets(data: Record<string, { data: unknown }>): FileMap {
  const assets: FileMap = {};

  for (const [path, file] of Object.entries(data)) {
    if (ASSET_EXTENSION.test(path) && !path.startsWith('.git/') && file.data instanceof Uint8Array) {
      assets[path] = { type: 'file', content: Buffer.from(file.data).toString('base64'), isBinary: true };
    }
  }

  return assets;
}

export async function restoreImportFiles(container: Pick<WebContainer, 'fs' | 'workdir'>, files: FileMap) {
  for (const [path, file] of Object.entries(files)) {
    const relativePath = path.startsWith(`${container.workdir}/`) ? path.slice(container.workdir.length + 1) : path;

    if (file?.type === 'folder') {
      await container.fs.mkdir(relativePath, { recursive: true });
    } else if (file?.type === 'file') {
      const parent = relativePath.slice(0, relativePath.lastIndexOf('/'));

      if (relativePath.includes('/')) {
        await container.fs.mkdir(parent, { recursive: true });
      }

      await container.fs.writeFile(relativePath, file.isBinary ? Buffer.from(file.content, 'base64') : file.content);
    }
  }
}
