/** Client-safe build-time data source flag (inlined by next.config.js from DATA_SOURCE). */
export type ClientDataSource = 'mock' | 'postgres';

export const CLIENT_DATA_SOURCE: ClientDataSource =
  process.env.NEXT_PUBLIC_QROBO_DATA_SOURCE === 'postgres' ? 'postgres' : 'mock';
