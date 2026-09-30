import { describe, expect, it } from 'vitest';
import { createCommandsMessage, detectProjectCommands } from './projectCommands';

describe('imported project setup', () => {
  it('installs dependencies without a prerequisite tool and starts Next.js afterwards', async () => {
    const commands = await detectProjectCommands([
      {
        path: 'package.json',
        content: JSON.stringify({ scripts: { dev: 'next dev' }, dependencies: { next: '^15' } }),
      },
    ]);

    expect(commands.setupCommand).toBe('npm install --no-audit --no-fund');
    expect(commands.setupCommand).not.toContain('npx');
    expect(commands.startCommand).toBe('npm run dev');

    const message = createCommandsMessage(commands)!;
    expect(message.content.indexOf('type="shell"')).toBeLessThan(message.content.indexOf('type="start"'));
  });
});
