/**
 * blitzyxsc.fxtwitter — FxTwitter API provider (primary no-auth backend).
 *
 * Evolved to handle the live FxTwitter v2 API response shape:
 *   - Profile:  { code, message, user, type: "profile" }
 *   - Timeline: { code, results: [...tweets], cursor: { top, bottom } }
 *   - Status:   { code, status, thread, author }  (404 → { status: null, code: 404 })
 *   - About:    { code, message, about_account: {...} }
 *   - Trends:   { code, timeline_type, trends: [...], cursor }
 *   - Typeahead:{ code, users: [...], topics, events }
 *   - Followers/Following: { code, results: [...users], cursor }
 *   - Reposts:  { code, results: [...users], cursor }
 *   - Conversation/Thread: { code, status, thread: [...], author }
 *
 * Author: Blitz (blitzlabx)
 * License: MIT
 */

import {
    FXTWITTER_API_V2_BASE,
    DEFAULT_HEADERS,
    DEFAULT_TIMEOUT_MS,
} from './constants';
import {
    BlitzyxscError,
    BlitzyxscNotFoundError,
    BlitzyxscParseError,
} from './exceptions';
import type {
    HashtagEntity, Media, MentionEntity, ProfileAbout,
    Trend, Tweet, UrlEntity, User,
} from './models';
import { httpGet } from './utils';

export interface FxTwitterProviderOptions {
    timeoutMs?: number;
    userAgent?: string;
}

export class FxTwitterProvider {
    readonly name = 'fxtwitter';
    protected readonly timeoutMs: number;
    protected readonly headers: Record<string, string>;

    constructor(opts: FxTwitterProviderOptions = {}) {
        this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        this.headers = { ...DEFAULT_HEADERS };
        if (opts.userAgent) {
            this.headers['User-Agent'] = opts.userAgent;
        }
    }

    async fetchProfile(handle: string): Promise<User> {
        const data = await this.getJson(`/2/profile/${stripHandle(handle)}`);
        // FxTwitter v2 returns { code: 200, user: {...} } on success.
        // On 404 it returns { code: 404, message: "..." } — no `user` field.
        if (data && data.code === 404) {
            throw new BlitzyxscNotFoundError(
                `FxTwitter 404: profile @${handle} not found (${data.message ?? 'not found'})`,
                { statusCode: 404, provider: this.name },
            );
        }
        const user = data?.user;
        if (!user) {
            throw new BlitzyxscParseError(
                `FxTwitter returned no user object for @${handle}`,
                { raw: JSON.stringify(data).slice(0, 500) },
            );
        }
        return parseUser(user);
    }

    async fetchStatus(tweetId: string): Promise<Tweet> {
        const data = await this.getJson(`/2/status/${cleanId(tweetId)}`);
        // FxTwitter v2 returns { code: 404, status: null } when tweet is missing.
        if (data && (data.code === 404 || !data.status)) {
            throw new BlitzyxscNotFoundError(
                `FxTwitter 404: tweet ${tweetId} not found`,
                { statusCode: 404, provider: this.name },
            );
        }
        const tweet = data.tweet || data.status;
        if (!tweet) {
            throw new BlitzyxscParseError(
                `FxTwitter returned no tweet object for id=${tweetId}`,
                { raw: JSON.stringify(data).slice(0, 500) },
            );
        }
        return parseTweet(tweet);
    }

    async fetchTimeline(handle: string, limit = 20): Promise<Tweet[]> {
        const data = await this.getJson(
            `/2/profile/${stripHandle(handle)}/statuses`,
            { limit: String(limit) },
        );
        if (data && data.code === 404) {
            throw new BlitzyxscNotFoundError(
                `FxTwitter 404: timeline for @${handle} not found`,
                { statusCode: 404, provider: this.name },
            );
        }
        // v2 wraps tweets in `results`. Older versions used `statuses` or `timeline`.
        const statuses = data.results || data.statuses || data.timeline || [];
        return statuses.filter(Boolean).map(parseTweet);
    }

    async fetchMedia(handle: string, limit = 20): Promise<Tweet[]> {
        const data = await this.getJson(
            `/2/profile/${stripHandle(handle)}/media`,
            { limit: String(limit) },
        );
        if (data && data.code === 404) {
            throw new BlitzyxscNotFoundError(
                `FxTwitter 404: media for @${handle} not found`,
                { statusCode: 404, provider: this.name },
            );
        }
        const statuses = data.results || data.statuses || data.media || [];
        return statuses.filter(Boolean).map(parseTweet);
    }

    async fetchFollowers(handle: string, limit = 20): Promise<User[]> {
        const data = await this.getJson(
            `/2/profile/${stripHandle(handle)}/followers`,
            { limit: String(limit) },
        );
        if (data && data.code === 404) {
            throw new BlitzyxscNotFoundError(
                `FxTwitter 404: followers for @${handle} not found`,
                { statusCode: 404, provider: this.name },
            );
        }
        const users = data.results || data.followers || data.users || [];
        return users.filter(Boolean).map(parseUser);
    }

    async fetchFollowing(handle: string, limit = 20): Promise<User[]> {
        const data = await this.getJson(
            `/2/profile/${stripHandle(handle)}/following`,
            { limit: String(limit) },
        );
        if (data && data.code === 404) {
            throw new BlitzyxscNotFoundError(
                `FxTwitter 404: following for @${handle} not found`,
                { statusCode: 404, provider: this.name },
            );
        }
        const users = data.results || data.following || data.users || [];
        return users.filter(Boolean).map(parseUser);
    }

    async fetchAbout(handle: string): Promise<ProfileAbout> {
        const data = await this.getJson(`/2/profile/${stripHandle(handle)}/about`);
        if (data && data.code === 404) {
            throw new BlitzyxscNotFoundError(
                `FxTwitter 404: about for @${handle} not found`,
                { statusCode: 404, provider: this.name },
            );
        }
        // v2 returns { code, message, about_account: {...} }
        const about = data.about_account || data.about || data;
        // If we fell through to `data` itself, strip envelope fields.
        const aboutObj: any = (about && typeof about === 'object') ? about : {};
        const profileData = await this.getJson(`/2/profile/${stripHandle(handle)}`).catch(() => null);
        const profileUser = profileData?.user;
        return {
            id: String(aboutObj.id_str ?? aboutObj.id ?? profileUser?.id ?? ''),
            screenName: aboutObj.screen_name ?? profileUser?.screen_name ?? handle,
            location: aboutObj.based_in ?? aboutObj.location ?? profileUser?.location,
            url: aboutObj.url ?? profileUser?.url,
            description: aboutObj.description ?? profileUser?.description,
            entities: aboutObj.entities || {},
            raw: aboutObj,
        };
    }

    async fetchConversation(tweetId: string) {
        const data = await this.getJson(`/2/conversation/${cleanId(tweetId)}`);
        if (data && (data.code === 404 || !data.status)) {
            throw new BlitzyxscNotFoundError(
                `FxTwitter 404: conversation for tweet ${tweetId} not found`,
                { statusCode: 404, provider: this.name },
            );
        }
        const rootObj = data.status || data.tweet;
        return {
            root: rootObj ? parseTweet(rootObj) : null,
            thread: (data.thread || []).filter(Boolean).map(parseTweet),
            replies: (data.replies || []).filter(Boolean).map(parseTweet),
            author: data.author ? parseUser(data.author) : null,
            cursorTop: data.cursor?.top ?? null,
            cursorBottom: data.cursor?.bottom ?? null,
        };
    }

    async fetchThread(tweetId: string) {
        const data = await this.getJson(`/2/thread/${cleanId(tweetId)}`);
        if (data && (data.code === 404 || !data.status)) {
            throw new BlitzyxscNotFoundError(
                `FxTwitter 404: thread for tweet ${tweetId} not found`,
                { statusCode: 404, provider: this.name },
            );
        }
        const rootObj = data.status || data.tweet;
        return {
            root: rootObj ? parseTweet(rootObj) : null,
            tweets: (data.thread || data.tweets || []).filter(Boolean).map(parseTweet),
        };
    }

    async fetchReposts(tweetId: string): Promise<User[]> {
        const data = await this.getJson(`/2/status/${cleanId(tweetId)}/reposts`);
        if (data && data.code === 404) {
            throw new BlitzyxscNotFoundError(
                `FxTwitter 404: reposts for tweet ${tweetId} not found`,
                { statusCode: 404, provider: this.name },
            );
        }
        // v2 wraps users in `results`. Older versions used `reposts` or `users`.
        const users = data.results || data.reposts || data.users || [];
        return users.filter(Boolean).map(parseUser);
    }

    async fetchTrends(): Promise<Trend[]> {
        const data = await this.getJson('/2/trends');
        if (data && data.code === 404) {
            throw new BlitzyxscNotFoundError(
                `FxTwitter 404: trends not found`,
                { statusCode: 404, provider: this.name },
            );
        }
        const trends = data.trends || [];
        return trends.filter(Boolean).map(parseTrend);
    }

    async searchUsers(query: string): Promise<User[]> {
        const data = await this.getJson('/2/typeahead', { q: query });
        if (data && data.code === 404) {
            throw new BlitzyxscNotFoundError(
                `FxTwitter 404: typeahead failed for "${query}"`,
                { statusCode: 404, provider: this.name },
            );
        }
        const users = data.users || [];
        return users.filter(Boolean).map(parseUser);
    }

    protected async getJson(
        path: string,
        params?: Record<string, string>,
    ): Promise<any> {
        const url = `${FXTWITTER_API_V2_BASE}${path}`;
        const resp = await httpGet(url, {
            params,
            headers: this.headers,
            timeoutMs: this.timeoutMs,
            provider: this.name,
        });
        let data: any;
        try {
            data = JSON.parse(resp.body);
        } catch (e: any) {
            throw new BlitzyxscParseError(
                `FxTwitter returned non-JSON body for ${path}: ${e.message}`,
                { raw: resp.body.slice(0, 500), url: resp.url, provider: this.name },
            );
        }
        if (data && typeof data === 'object') {
            const code = data.code ?? data.status;
            if (code === 404 || data.message === 'NOT_FOUND' || data.message === 'Not found') {
                throw new BlitzyxscNotFoundError(
                    `FxTwitter 404: ${data.message ?? 'not found'} (path: ${path})`,
                    { statusCode: 404, url, provider: this.name },
                );
            }
        }
        return data;
    }
}

// --- Helpers -----------------------------------------------------------

function stripHandle(handle: string): string {
    return handle.replace(/^@/, '').trim();
}

function cleanId(id: string): string {
    return String(id).trim();
}

function parseUser(obj: any): User {
    const verification = obj.verification || {};
    const rawDesc = obj.raw_description;
    return {
        id: String(obj.id ?? obj.id_str ?? ''),
        screenName: obj.screen_name ?? '',
        name: obj.name,
        description: obj.description,
        rawDescription: (rawDesc && typeof rawDesc === 'object') ? rawDesc : null,
        location: obj.location,
        url: obj.url,
        website: obj.website,
        followers: obj.followers,
        following: obj.following,
        likes: obj.likes,
        tweets: obj.tweets ?? obj.statuses,
        mediaCount: obj.media_count,
        avatarUrl: obj.avatar_url ?? obj.profile_image_url,
        bannerUrl: obj.banner_url ?? obj.profile_banner_url,
        joined: obj.joined,
        protected: obj.protected,
        verified: verification.verified,
        verificationType: verification.type,
        verifiedAt: verification.verified_at,
    };
}

function parseTweet(obj: any): Tweet {
    if (!obj) {
        throw new BlitzyxscParseError('FxTwitter returned empty tweet object');
    }
    const authorObj = obj.author || obj.user;
    const author = authorObj ? parseUser(authorObj) : undefined;

    // Extract mentions/hashtags/urls from raw_text.facets if present, else from top-level arrays.
    const facets = obj.raw_text?.facets || [];
    const mentions: MentionEntity[] = [];
    const hashtags: HashtagEntity[] = [];
    const urls: UrlEntity[] = [];

    if (facets.length > 0) {
        for (const f of facets) {
            const indices = f.indices || [];
            const start = indices[0];
            const end = indices[1];
            if (f.type === 'mention') {
                mentions.push({
                    username: f.original || f.screen_name || f.username || '',
                    userId: f.id != null ? String(f.id) : undefined,
                    name: f.name,
                    start,
                    end,
                });
            } else if (f.type === 'hashtag') {
                hashtags.push({
                    text: f.original || f.text || '',
                    start,
                    end,
                });
            } else if (f.type === 'url') {
                urls.push({
                    url: f.original || f.url || '',
                    displayUrl: f.display,
                    expandedUrl: f.replacement || f.expanded_url,
                    start,
                    end,
                });
            }
        }
    } else {
        for (const m of (obj.mentions || [])) {
            mentions.push({
                username: m.screen_name ?? m.username ?? '',
                userId: m.id != null ? String(m.id) : undefined,
                name: m.name,
                start: typeof m === 'object' ? m.start : undefined,
                end: typeof m === 'object' ? m.end : undefined,
            });
        }
        for (const h of (obj.hashtags || [])) {
            hashtags.push({ text: h.text ?? '', start: h.start, end: h.end });
        }
        for (const u of (obj.urls || [])) {
            urls.push({
                url: u.url ?? '',
                displayUrl: u.display_url,
                expandedUrl: u.expanded_url,
                start: u.start,
                end: u.end,
            });
        }
    }

    const media: Media[] = [];
    // FxTwitter returns media either as an array OR as an object with
    // {all: [...], photos: [...], videos: [...]} — handle both shapes.
    // Empty tweets return `media: {}` (empty object) — treat as no media.
    let mediaRaw: any = obj.media ?? obj.media_all;
    if (mediaRaw && typeof mediaRaw === 'object' && !Array.isArray(mediaRaw)) {
        const m = mediaRaw as any;
        const all = Array.isArray(m.all) ? m.all : [];
        const photos = Array.isArray(m.photos) ? m.photos : [];
        const videos = Array.isArray(m.videos) ? m.videos : [];
        const gifs = Array.isArray(m.animated_gif) ? m.animated_gif : [];
        if (all.length > 0) {
            mediaRaw = all;
        } else if (photos.length || videos.length || gifs.length) {
            mediaRaw = [...photos, ...videos, ...gifs];
        } else {
            // Empty `{}` — no media.
            mediaRaw = [];
        }
    }
    if (Array.isArray(mediaRaw)) {
        for (const m of mediaRaw) {
            if (typeof m === 'string') {
                media.push({ type: 'photo', url: m, variants: [] });
                continue;
            }
            if (!m || typeof m !== 'object') continue;
            const variants = m.variants || [];
            media.push({
                type: m.type ?? 'photo',
                url: m.url,
                altText: m.alt_text,
                width: m.width,
                height: m.height,
                durationMs: m.duration_ms ?? m.duration,
                previewUrl: m.preview_url ?? m.thumbnail_url,
                variants,
            });
        }
    }

    const quoted = obj.quoted_tweet || obj.quote;
    const retweeted = obj.retweeted_tweet || obj.retweet;

    // v2 uses: replies, reposts, likes, bookmarks, quotes
    // v1 used: reply_count, retweet_count, favorite_count, bookmark_count, quote_count
    return {
        id: String(obj.id ?? obj.id_str ?? ''),
        text: obj.text ?? obj.full_text,
        author,
        createdAt: obj.created_at,
        replyCount: obj.replies ?? obj.reply_count,
        quoteCount: obj.quotes ?? obj.quote_count,
        retweetCount: obj.reposts ?? obj.retweet_count ?? obj.retweets,
        favoriteCount: obj.likes ?? obj.favorite_count,
        bookmarkCount: obj.bookmarks ?? obj.bookmark_count,
        views: obj.views,
        language: obj.lang ?? obj.language,
        inReplyToStatusId: obj.in_reply_to_status_id != null
            ? String(obj.in_reply_to_status_id) : (obj.replying_to?.status ? String(obj.replying_to.status) : undefined),
        inReplyToUserId: obj.in_reply_to_user_id != null
            ? String(obj.in_reply_to_user_id) : undefined,
        inReplyToScreenName: obj.in_reply_to_screen_name ?? obj.replying_to?.screen_name,
        conversationId: obj.conversation_id != null
            ? String(obj.conversation_id) : undefined,
        isQuoteStatus: Boolean(obj.is_quote_status) || Boolean(quoted),
        isRetweet: Boolean(obj.is_retweet) || retweeted != null,
        isReply: Boolean(
            obj.in_reply_to_status_id || obj.in_reply_to_screen_name || obj.replying_to,
        ),
        isThread: Boolean(obj.is_thread),
        sensitive: Boolean(obj.sensitive || obj.nsfw || obj.possibly_sensitive),
        nsfw: Boolean(obj.nsfw),
        mentions,
        hashtags,
        urls,
        media,
        quotedTweet: quoted ? parseTweet(quoted) : null,
        retweetedTweet: retweeted ? parseTweet(retweeted) : null,
        raw: obj,
    };
}

function parseTrend(obj: any): Trend {
    return {
        name: obj.name ?? obj.trend_name ?? '',
        url: obj.url,
        tweetCount: obj.tweet_count,
        formattedTweetCount: obj.formatted_tweet_count,
        description: obj.description ?? obj.context,
        raw: obj,
    };
}

export { parseUser, parseTweet, parseTrend, stripHandle, cleanId };
