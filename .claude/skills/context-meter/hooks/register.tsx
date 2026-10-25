import { atom, read, update } from 'claude-code';
import type { Register, SessionContextUsage } from 'claude-code';

import type { Meter } from '../types';

const meter = atom({ plugin: 'context-meter', key: 'meter' } as const, null);

const BAR_WIDTH = 20;

function toMeter(context: SessionContextUsage): Meter {
  return {
    tokens: context.tokens ?? null,
    window: context.window,
    percent: context.percent ?? null,
  };
}

function formatTokens(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function colorFor(percent: number): string {
  if (percent >= 80) return 'red';
  if (percent >= 50) return 'yellow';
  return 'green';
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e);
    const { context } = await $.session.usage();
    await update($, meter, () => toMeter(context));
    return result;
  });

  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('context')) {
      await update($, meter, () => toMeter(e.context));
    }
    return next(e);
  });

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const m = await read($, meter);
    if (e.props.hasSurvey || m === null) {
      return next(e);
    }

    const { Box, Text } = $.ui.resolve(e);
    const percent = m.percent ?? 0;
    const filled = Math.round((percent / 100) * BAR_WIDTH);
    const used = m.tokens === null ? '-' : formatTokens(m.tokens);

    return (
      <Box>
        <Text dimColor>Context </Text>
        <Text color={colorFor(percent)}>{'█'.repeat(filled)}</Text>
        <Text dimColor>{'░'.repeat(BAR_WIDTH - filled)}</Text>
        <Text dimColor>
          {' '}
          {percent}% ({used} / {formatTokens(m.window)} tokens)
        </Text>
      </Box>
    );
  });
};
