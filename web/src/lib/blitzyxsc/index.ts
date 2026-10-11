/**
 * blitzyxsc — no-auth X/Twitter data fetching library (TypeScript edition).
 *
 * Built on top of public endpoints (FxTwitter, Twitter Syndication,
 * raw GraphQL with guest token). No API keys, no OAuth, no login.
 *
 * Author: Blitz (blitzlabx)
 * License: MIT
 */

export * from './models';
export * from './exceptions';
export * from './client';
export * from './fxtwitter';
export * from './syndication';
export * from './graphql';
export * from './constants';

export {
    Blitzyxsc,
    BlitzyxscClient,
    type BlitzyxscOptions,
    type ProviderName,
} from './client';

export const VERSION = '1.0.0';
export const AUTHOR = 'Blitz (blitzlabx)';
export const LICENSE = 'MIT';
export const PACKAGE_NAME = 'blitzyxsc';

// Convenience default client (singleton)
let _defaultClient: Blitzyxsc | null = null;

export function getDefaultClient(): Blitzyxsc {
    if (!_defaultClient) {
        _defaultClient = new Blitzyxsc();
    }
    return _defaultClient;
}

export function fetchProfile(handle: string) {
    return getDefaultClient().fetchProfile(handle);
}
export function fetchStatus(tweetId: string) {
    return getDefaultClient().fetchStatus(tweetId);
}
export function fetchTimeline(handle: string, limit = 20) {
    return getDefaultClient().fetchTimeline(handle, limit);
}
export function fetchReplies(tweetId: string) {
    return getDefaultClient().fetchReplies(tweetId);
}
export function fetchThread(tweetId: string) {
    return getDefaultClient().fetchThread(tweetId);
}
export function fetchTrends() {
    return getDefaultClient().fetchTrends();
}
export function fetchFollowers(handle: string, limit = 20) {
    return getDefaultClient().fetchFollowers(handle, limit);
}
export function fetchFollowing(handle: string, limit = 20) {
    return getDefaultClient().fetchFollowing(handle, limit);
}
export function fetchMedia(handle: string, limit = 20) {
    return getDefaultClient().fetchMedia(handle, limit);
}
export function searchUsers(query: string) {
    return getDefaultClient().searchUsers(query);
}
export function fetchMentions(handle: string, limit = 20) {
    return getDefaultClient().fetchMentions(handle, limit);
}
