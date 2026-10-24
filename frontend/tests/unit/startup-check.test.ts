import { describe, expect, it, vi } from 'vitest';
import { runStartupChecks } from '@/lib/server/startup-check';

const goodDb = { DATABASE_URL: 'postgres://qrobo_app:s3cret-x@qrobo-db.abc.ap-south-1.rds.amazonaws.com:5432/qrobo', DATABASE_SSL: 'verify-full' };

describe('runStartupChecks', () => {
  const quiet = () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  };

  it('passes for a matching postgres build with valid DB config', () => {
    quiet();
    const exit = vi.fn();
    expect(runStartupChecks({ DATA_SOURCE: 'postgres', NODE_ENV: 'production', ...goodDb }, exit, 'postgres')).toEqual([]);
    expect(exit).not.toHaveBeenCalled();
  });

  it('exits in production when build and runtime data sources differ (both directions)', () => {
    quiet();
    for (const [runtime, built] of [['mock', 'postgres'], ['postgres', 'mock']]) {
      const exit = vi.fn();
      const problems = runStartupChecks({ DATA_SOURCE: runtime, NODE_ENV: 'production', ...goodDb }, exit, built);
      expect(problems.join(' ')).toMatch(/Rebuild with the same value/);
      expect(exit).toHaveBeenCalledWith(1);
    }
  });

  it('exits in production when postgres config is missing or a placeholder, without mismatch noise', () => {
    quiet();
    const exit = vi.fn();
    const problems = runStartupChecks({ DATA_SOURCE: 'postgres', NODE_ENV: 'production', DATABASE_SSL: 'verify-full' }, exit, 'postgres');
    expect(problems).toEqual(['DATA_SOURCE=postgres but DATABASE_URL is not set.']);
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('only warns outside production', () => {
    quiet();
    const exit = vi.fn();
    expect(runStartupChecks({ DATA_SOURCE: 'postgres', NODE_ENV: 'development' }, exit, 'postgres').length).toBe(1);
    expect(exit).not.toHaveBeenCalled();
  });
});
