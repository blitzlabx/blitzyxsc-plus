/**
 * blitzyxsc-plus — config & metadata.
 *
 * Author: Blitz (blitzlabx)
 */

export const BLITZ_META = {
  name: 'blitzyxsc-plus',
  tagline: 'Blitz no-auth X/Twitter data API — as a service.',
  author: 'Blitz',
  handle: 'blitzlabx',
  website: 'https://blitzyxsc-plus.pages.dev',
  github: 'https://github.com/blitzlabx/blitzyxsc-plus',
  twitter: 'https://x.com/blitzlabx',
  donation: 'https://flutterwave.com/donate/knjcdfjgzwyt',
  version: '1.0.0',
  license: 'MIT',
  creatorLabel: 'blitzyxsc-plus by Blitz created by blitzlabx',
};

export const BLITZ_DEFAULTS = {
  timeoutMs: 25000,
  retry: 2,
  defaultLimit: 20,
  maxLimit: 100,
  cacheTtlProfileSec: 300,        // 5 min
  cacheTtlStatusSec: 1800,       // 30 min
  cacheTtlTimelineSec: 60,       // 1 min
  cacheTtlTrendsSec: 300,        // 5 min
  cacheTtlFollowersSec: 3600,    // 1 hour
  cacheTtlConversationSec: 30,   // 30 sec
  rateLimitPerMin: 60,
  rateLimitWindowMs: 60_000,
};

export const BLITZ_PROVIDERS = ['fxtwitter', 'syndication', 'graphql'] as const;
export type BlitzProvider = (typeof BLITZ_PROVIDERS)[number];

export const BLITZ_ENDPOINTS: Array<{
  method: 'GET';
  path: string;
  summary: string;
  cacheTtlSec: number;
  params?: Array<{ name: string; type: string; required: boolean; description: string }>;
}> = [
  {
    method: 'GET',
    path: '/api/profile/:handle',
    summary: 'Fetch a user profile by screen name.',
    cacheTtlSec: BLITZ_DEFAULTS.cacheTtlProfileSec,
    params: [{ name: 'handle', type: 'string', required: true, description: 'Twitter screen name (with or without @)' }],
  },
  {
    method: 'GET',
    path: '/api/status/:id',
    summary: 'Fetch a single tweet by ID.',
    cacheTtlSec: BLITZ_DEFAULTS.cacheTtlStatusSec,
    params: [{ name: 'id', type: 'string', required: true, description: 'Numeric tweet ID' }],
  },
  {
    method: 'GET',
    path: '/api/timeline/:handle',
    summary: "Fetch a user's recent tweets.",
    cacheTtlSec: BLITZ_DEFAULTS.cacheTtlTimelineSec,
    params: [
      { name: 'handle', type: 'string', required: true, description: 'Twitter screen name' },
      { name: 'limit', type: 'integer', required: false, description: 'Max tweets to return (default 20, max 100)' },
    ],
  },
  {
    method: 'GET',
    path: '/api/media/:handle',
    summary: "Fetch a user's media-only timeline.",
    cacheTtlSec: BLITZ_DEFAULTS.cacheTtlTimelineSec,
    params: [
      { name: 'handle', type: 'string', required: true, description: 'Twitter screen name' },
      { name: 'limit', type: 'integer', required: false, description: 'Default 20' },
    ],
  },
  {
    method: 'GET',
    path: '/api/replies/:id',
    summary: 'Fetch the full conversation (root + thread + replies) for a tweet.',
    cacheTtlSec: BLITZ_DEFAULTS.cacheTtlConversationSec,
    params: [{ name: 'id', type: 'string', required: true, description: 'Root tweet ID' }],
  },
  {
    method: 'GET',
    path: '/api/thread/:id',
    summary: 'Fetch an unrolled thread (root + same-author follow-ups only).',
    cacheTtlSec: BLITZ_DEFAULTS.cacheTtlConversationSec,
    params: [{ name: 'id', type: 'string', required: true, description: 'Root tweet ID' }],
  },
  {
    method: 'GET',
    path: '/api/trends',
    summary: 'Fetch current trending topics.',
    cacheTtlSec: BLITZ_DEFAULTS.cacheTtlTrendsSec,
  },
  {
    method: 'GET',
    path: '/api/search/users',
    summary: 'Search for users via typeahead.',
    cacheTtlSec: 60,
    params: [{ name: 'q', type: 'string', required: true, description: 'Search query' }],
  },
  {
    method: 'GET',
    path: '/api/followers/:handle',
    summary: "Fetch a user's followers list.",
    cacheTtlSec: BLITZ_DEFAULTS.cacheTtlFollowersSec,
    params: [
      { name: 'handle', type: 'string', required: true },
      { name: 'limit', type: 'integer', required: false, description: 'Default 20' },
    ],
  },
  {
    method: 'GET',
    path: '/api/following/:handle',
    summary: "Fetch a user's following list.",
    cacheTtlSec: BLITZ_DEFAULTS.cacheTtlFollowersSec,
    params: [
      { name: 'handle', type: 'string', required: true },
      { name: 'limit', type: 'integer', required: false, description: 'Default 20' },
    ],
  },
  {
    method: 'GET',
    path: '/api/mentions/:handle',
    summary: "Fetch a user's recent replies (each is a mention of its parent's author).",
    cacheTtlSec: BLITZ_DEFAULTS.cacheTtlTimelineSec,
    params: [
      { name: 'handle', type: 'string', required: true },
      { name: 'limit', type: 'integer', required: false, description: 'Default 20' },
    ],
  },
  {
    method: 'GET',
    path: '/api/about/:handle',
    summary: 'Fetch extended profile metadata (location, country, link, etc.).',
    cacheTtlSec: BLITZ_DEFAULTS.cacheTtlProfileSec,
    params: [{ name: 'handle', type: 'string', required: true }],
  },
  {
    method: 'GET',
    path: '/api/reposts/:id',
    summary: 'Fetch the list of users who reposted a tweet.',
    cacheTtlSec: BLITZ_DEFAULTS.cacheTtlStatusSec,
    params: [{ name: 'id', type: 'string', required: true }],
  },
  {
    method: 'GET',
    path: '/health',
    summary: 'Service health check.',
    cacheTtlSec: 0,
  },
];
