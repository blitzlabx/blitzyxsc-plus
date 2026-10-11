/**
 * blitzyxsc.fxtwitter — FxTwitter API provider (primary no-auth backend).
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
        const user = data.user;
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
        const statuses = data.results || data.statuses || data.timeline || [];
        return statuses.filter(Boolean).map(parseTweet);
    }

    async fetchMedia(handle: string, limit = 20): Promise<Tweet[]> {
        const data = await this.getJson(
            `/2/profile/${stripHandle(handle)}/media`,
            { limit: String(limit) },
        );
        const statuses = data.results || data.statuses || data.media || [];
        return statuses.filter(Boolean).map(parseTweet);
    }

    async fetchFollowers(handle: string, limit = 20): Promise<User[]> {
        const data = await this.getJson(
            `/2/profile/${stripHandle(handle)}/followers`,
            { limit: String(limit) },
        );
        const users = data.results || data.followers || data.users || [];
        return users.filter(Boolean).map(parseUser);
    }

    async fetchFollowing(handle: string, limit = 20): Promise<User[]> {
        const data = await this.getJson(
            `/2/profile/${stripHandle(handle)}/following`,
            { limit: String(limit) },
        );
        const users = data.results || data.following || data.users || [];
        return users.filter(Boolean).map(parseUser);
    }

    async fetchAbout(handle: string): Promise<ProfileAbout> {
        const data = await this.getJson(`/2/profile/${stripHandle(handle)}/about`);
        const about = data.about || data;
        return {
            id: String(about.id_str ?? about.id ?? ''),
            screenName: about.screen_name ?? handle,
            location: about.location,
            url: about.url,
            description: about.description,
            entities: about.entities || {},
            raw: about,
        };
    }

    async fetchConversation(tweetId: string) {
        const data = await this.getJson(`/2/conversation/${cleanId(tweetId)}`);
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
        const rootObj = data.status || data.tweet;
        return {
            root: rootObj ? parseTweet(rootObj) : null,
            tweets: (data.thread || data.tweets || []).filter(Boolean).map(parseTweet),
        };
    }

    async fetchReposts(tweetId: string): Promise<User[]> {
        const data = await this.getJson(`/2/status/${cleanId(tweetId)}/reposts`);
        const users = data.reposts || data.users || [];
        return users.filter(Boolean).map(parseUser);
    }

    async fetchTrends(): Promise<Trend[]> {
        const data = await this.getJson('/2/trends');
        const trends = data.trends || [];
        return trends.filter(Boolean).map(parseTrend);
    }

    async searchUsers(query: string): Promise<User[]> {
        const data = await this.getJson('/2/typeahead', { q: query });
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

    const mentions: MentionEntity[] = (obj.mentions || []).map((m: any) => ({
        username: m.screen_name ?? m.username ?? '',
        userId: m.id != null ? String(m.id) : undefined,
        name: m.name,
        start: typeof m === 'object' ? m.start : undefined,
        end: typeof m === 'object' ? m.end : undefined,
    }));

    const hashtags: HashtagEntity[] = (obj.hashtags || []).map((h: any) => ({
        text: h.text ?? '',
        start: h.start,
        end: h.end,
    }));

    const urls: UrlEntity[] = (obj.urls || []).map((u: any) => ({
        url: u.url ?? '',
        displayUrl: u.display_url,
        expandedUrl: u.expanded_url,
        start: u.start,
        end: u.end,
    }));

    const media: Media[] = [];
    // FxTwitter returns media either as an array OR as an object with
    // {all: [...], photos: [...], videos: [...]} — handle both shapes.
    let mediaRaw: any[] | { all?: any[]; photos?: any[]; videos?: any[]; animated_gif?: any[] } | undefined =
        obj.media || obj.media_all;
    if (mediaRaw && typeof mediaRaw === 'object' && !Array.isArray(mediaRaw)) {
        // Object form: prefer .all, then concat all known sub-fields
        const m = mediaRaw as any;
        mediaRaw = (m.all && Array.isArray(m.all) && m.all.length > 0)
            ? m.all
            : [...(m.photos || []), ...(m.videos || []), ...(m.animated_gif || [])];
    }
    for (const m of (mediaRaw as any[] || [])) {
        if (typeof m === 'string') {
            media.push({ type: 'photo', url: m, variants: [] });
            continue;
        }
        if (!m || typeof m !== 'object') continue;
        media.push({
            type: m.type ?? 'photo',
            url: m.url,
            altText: m.alt_text,
            width: m.width,
            height: m.height,
            durationMs: m.duration_ms ?? m.duration,
            previewUrl: m.preview_url ?? m.thumbnail_url,
            variants: m.variants || [],
        });
    }

    const quoted = obj.quoted_tweet || obj.quote;
    const retweeted = obj.retweeted_tweet || obj.retweet;

    return {
        id: String(obj.id ?? obj.id_str ?? ''),
        text: obj.text ?? obj.full_text,
        author,
        createdAt: obj.created_at,
        replyCount: obj.reply_count ?? obj.replies,
        quoteCount: obj.quote_count,
        retweetCount: obj.retweet_count ?? obj.retweets,
        favoriteCount: obj.favorite_count ?? obj.likes,
        bookmarkCount: obj.bookmark_count,
        views: obj.views,
        language: obj.lang ?? obj.language,
        inReplyToStatusId: obj.in_reply_to_status_id != null
            ? String(obj.in_reply_to_status_id) : undefined,
        inReplyToUserId: obj.in_reply_to_user_id != null
            ? String(obj.in_reply_to_user_id) : undefined,
        inReplyToScreenName: obj.in_reply_to_screen_name,
        conversationId: obj.conversation_id != null
            ? String(obj.conversation_id) : undefined,
        isQuoteStatus: Boolean(obj.is_quote_status),
        isRetweet: Boolean(obj.is_retweet) || retweeted != null,
        isReply: Boolean(obj.in_reply_to_status_id || obj.in_reply_to_screen_name),
        isThread: Boolean(obj.is_thread),
        sensitive: Boolean(obj.sensitive || obj.nsfw),
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
        description: obj.description,
        raw: obj,
    };
}

export { parseUser, parseTweet, parseTrend, stripHandle, cleanId };
