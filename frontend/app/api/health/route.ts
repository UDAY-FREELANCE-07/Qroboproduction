import { NextResponse } from 'next/server';
import { getDbStatus } from '@/lib/server/db';
import { resolveDataSource } from '@/lib/server/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/health — liveness + database readiness for load balancers / monitoring.
 * Returns only coarse status strings; never hostnames, versions or error details.
 * 200 when serving normally, 503 when PostgreSQL mode is selected but the DB is not usable.
 */
export async function GET() {
  let dataSource: 'mock' | 'postgres' | 'invalid';
  try {
    dataSource = resolveDataSource();
  } catch {
    dataSource = 'invalid';
  }
  const database = dataSource === 'postgres' ? await getDbStatus() : 'disabled';
  const healthy = dataSource === 'mock' || database === 'ok';
  return NextResponse.json(
    { status: healthy ? 'ok' : 'error', dataSource, database },
    { status: healthy ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
