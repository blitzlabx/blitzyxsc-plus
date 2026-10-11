/**
 * blitzyxsc.constants — static endpoint URLs, headers, and known IDs.
 */

export const VERSION = '1.0.0';
export const AUTHOR = 'Blitz (blitzlabx)';
export const LICENSE = 'MIT';
export const PACKAGE_NAME = 'blitzyxsc';
export const GITHUB = 'https://github.com/blitzlabx/blitzyxsc';

/**
 * Default provider order. The first provider that successfully handles
 * a request wins. The graphql provider is intentionally NOT in the
 * default chain because Twitter rotates GraphQL query IDs frequently;
 * users can opt-in by passing providers=['fxtwitter','syndication','graphql'].
 */
export const DEFAULT_PROVIDERS: readonly ProviderName[] = ['fxtwitter', 'syndication'] as const;

export type ProviderName = 'fxtwitter' | 'syndication' | 'graphql';

// FxTwitter API base URL (primary no-auth provider).
export const FXTWITTER_API_BASE = 'https://api.fxtwitter.com';
export const FXTWITTER_API_V2_BASE = 'https://api.fxtwitter.com';

// Twitter syndication CDN (fallback for individual tweets).
export const SYNDICATION_API_BASE = 'https://cdn.syndication.twimg.com';
export const SYNDICATION_TWEET_RESULT_URL = `${SYNDICATION_API_BASE}/tweet-result`;

// Twitter GraphQL API base (raw, requires guest token).
export const TWITTER_GRAPHQL_API_BASE = 'https://api.x.com/graphql';
export const TWITTER_GUEST_ACTIVATE_URL = 'https://api.x.com/1.1/guest/activate.json';

// oEmbed (limited — only returns HTML for individual tweets).
export const TWITTER_OEMBED_URL = 'https://publish.twitter.com/oembed';

/**
 * Public Twitter web bearer token (compiled into Twitter's web app JS bundle).
 * This is publicly visible to every browser visitor of x.com — NOT secret.
 */
export const TWITTER_PUBLIC_BEARER_TOKEN =
    'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D' +
    '1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

/** GraphQL query IDs (rotate when Twitter updates their web app). */
export const GRAPHQL_QUERIES: Record<string, string> = {
    TweetResultByRestId: 'f2sagi1jweVHFkTUIHzmMQ',
    UserByScreenName: 'IGgvgiOx4QZndDHuD3x9TQ',
    UserTweets: 'O0epvwaQPUx-bT9YlqlL6w',
    UserTweetsAndReplies: 'uQ9anuxU5S8nU1E5z9LrKw',
    UserMedia: 'wtQiLZf3yMQ9lnNLPfXfXw',
    Followers: '-FpGYzBsUxUOecYYfso0yA',
    Following: 'gm9JXQn7TPiHjG3DNSUaUQ',
    SearchTimeline: 'GcXk9vN_d1jUfHNqLacXQA',
    ConversationTimeline: 'b-bCN9RelT8k0fCr_s2BFg',
};

/** Endpoints that REQUIRE a real Twitter account (guest token won't work). */
export const REQUIRES_ACCOUNT_QUERIES = new Set<string>([
    'SearchTimeline',
    'ConversationTimeline',
    'Followers',
    'Following',
]);

/** Default headers (browser-like). */
export const DEFAULT_HEADERS: Record<string, string> = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/120.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    Connection: 'keep-alive',
};

/** Headers required for raw Twitter GraphQL calls. */
export const GRAPHQL_HEADERS: Record<string, string> = {
    ...DEFAULT_HEADERS,
    Authorization: `Bearer ${TWITTER_PUBLIC_BEARER_TOKEN}`,
    Origin: 'https://x.com',
    Referer: 'https://x.com/home',
    'x-twitter-active-user': 'yes',
    'x-twitter-client-language': 'en',
};

/** Request settings. */
export const DEFAULT_TIMEOUT_MS = 20000;
export const DEFAULT_RETRY = 2;
export const DEFAULT_LIMIT = 20;
export const RATE_LIMIT_BACKOFF_MS = 2000;

/** Authorship / branding (used in CLI banner, docs, etc.). */
export const BRANDING = {
    name: 'blitzyxsc',
    tagline: "Blitz's no-auth X/Twitter data API",
    author: 'Blitz',
    handle: 'blitzlabx',
    creator_label: 'blitzyxsc by Blitz created by blitzlabx',
    github: 'https://github.com/blitzlabx/blitzyxsc',
    twitter_handle: 'blitzlabx',
    license: 'MIT',
    version: '1.0.0',
} as const;
