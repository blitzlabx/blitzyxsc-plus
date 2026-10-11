/**
 * blitzyxsc.syndication — Twitter syndication CDN provider (fallback).
 *
 * This provider only implements the single-tweet endpoint:
 *     GET https://cdn.syndication.twimg.com/tweet-result?id={id}&token=0
 *
 * The `token` parameter can be ANY non-empty string (`0` is fine). Without
 * it, the endpoint returns an empty body. The body is a flat JSON object
 * (not wrapped in {code, tweet}).
 */

import {
    SYNDICATION_TWEET_RESULT_URL,
    DEFAULT_HEADERS,
    DEFAULT_TIMEOUT_MS,
} from './constants';
import {
    BlitzyxscNotFoundError,
    BlitzyxscParseError,
} from './exceptions';
import type { Media, Tweet, User } from './models';
import { httpGet } from './utils';

export interface SyndicationProviderOptions {
    timeoutMs?: number;
    userAgent?: string;
}

export class SyndicationProvider {
    readonly name = 'syndication';
    protected readonly timeoutMs: number;
    protected readonly headers: Record<string, string>;

    constructor(opts: SyndicationProviderOptions = {}) {
        this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        this.headers = { ...DEFAULT_HEADERS };
        this.headers['Referer'] = 'https://platform.twitter.com/';
        this.headers['Origin'] = 'https://platform.twitter.com';
        if (opts.userAgent) {
            this.headers['User-Agent'] = opts.userAgent;
        }
    }

    async fetchStatus(tweetId: string): Promise<Tweet> {
        const params = {
            id: String(tweetId).trim(),
            token: '0',
            lang: 'en',
        };
        const resp = await httpGet(SYNDICATION_TWEET_RESULT_URL, {
            params,
            headers: this.headers,
            timeoutMs: this.timeoutMs,
            provider: this.name,
        });
        if (!resp.body) {
            throw new BlitzyxscNotFoundError(
                `Syndication returned empty body for tweet ${tweetId} ` +
                '(tweet is private/deleted, or syndication is rate-limited)',
                { statusCode: resp.statusCode, url: resp.url, provider: this.name },
            );
        }
        let data: any;
        try {
            data = JSON.parse(resp.body);
        } catch (e: any) {
            throw new BlitzyxscParseError(
                `Syndication returned non-JSON body for tweet ${tweetId}: ${e.message}`,
                { raw: resp.body.slice(0, 500), url: resp.url, provider: this.name },
            );
        }
        if (data && data.__typename === 'TweetTombstone') {
            throw new BlitzyxscNotFoundError(
                `Tweet ${tweetId} is unavailable (tombstoned)`,
                { url: resp.url, provider: this.name },
            );
        }
        return parseSyndicationTweet(data);
    }
}

function parseSyndicationTweet(obj: any): Tweet {
    const userObj = obj.user || {};
    const author: User = {
        id: String(userObj.id_str ?? userObj.id ?? ''),
        screenName: userObj.screen_name ?? '',
        name: userObj.name,
        avatarUrl: userObj.profile_image_url_https ?? userObj.profile_image_url,
        verified: userObj.verified,
    };

    const mediaList: Media[] = [];
    for (const m of (obj.mediaDetails || obj.media || [])) {
        const originalInfo = (m && typeof m === 'object' && m.original_info) || {};
        mediaList.push({
            type: m.type ?? 'photo',
            url: m.media_url_https ?? m.media_url,
            width: originalInfo.width,
            height: originalInfo.height,
            altText: m.alt_text,
            previewUrl: m.media_url_https ?? m.media_url,
            variants: [],
        });
    }

    const views = (obj.views && typeof obj.views === 'object') ? obj.views.count : obj.views;

    return {
        id: String(obj.id_str ?? obj.rest_id ?? obj.id ?? ''),
        text: obj.text ?? obj.full_text,
        author,
        createdAt: obj.created_at,
        replyCount: obj.conversation_count,
        retweetCount: obj.retweet_count,
        favoriteCount: obj.favorite_count,
        bookmarkCount: obj.bookmark_count,
        views,
        language: obj.lang,
        mentions: [],
        hashtags: [],
        urls: [],
        media: mediaList,
        isQuoteStatus: false,
        isRetweet: false,
        isReply: false,
        isThread: false,
        sensitive: false,
        nsfw: false,
        raw: obj,
    };
}

export { parseSyndicationTweet };
