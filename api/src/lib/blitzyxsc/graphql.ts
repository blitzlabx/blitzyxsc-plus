/**
 * blitzyxsc.graphql — raw Twitter GraphQL provider with guest token.
 *
 * Self-hostable alternative to FxTwitter. Acquires a guest token, then
 * calls Twitter's GraphQL endpoints directly.
 *
 * NOTE:
 *   * Profile, single tweet, and user timeline work with a guest token.
 *   * Search, conversation/replies, followers require an authenticated account.
 *   * Twitter rotates GraphQL query IDs frequently — update GRAPHQL_QUERIES
 *     in constants.ts when calls start returning 404.
 */

import {
    GRAPHQL_QUERIES,
    GRAPHQL_HEADERS,
    REQUIRES_ACCOUNT_QUERIES,
    TWITTER_GRAPHQL_API_BASE,
    TWITTER_GUEST_ACTIVATE_URL,
    DEFAULT_HEADERS,
    DEFAULT_TIMEOUT_MS,
} from './constants';
import {
    BlitzyxscAuthError,
    BlitzyxscError,
    BlitzyxscNotFoundError,
    BlitzyxscParseError,
    BlitzyxscRateLimitError,
} from './exceptions';
import type { Tweet, User } from './models';
import { httpGet, httpPost } from './utils';

export interface GraphQLProviderOptions {
    timeoutMs?: number;
    userAgent?: string;
    guestToken?: string;
    guestTokenTtlSec?: number;
}

const USER_BY_SCREEN_NAME_FEATURES = {
    hidden_profile_subscriptions_enabled: true,
    rweb_tipjar_consumption_enabled: true,
    responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false,
    subscriptions_verification_info_is_identity_verified_enabled: true,
    subscriptions_verification_info_verified_since_enabled: true,
    highlights_tweets_tab_ui_enabled: true,
    responsive_web_twitter_article_notes_tab_enabled: true,
    subscriptions_feature_can_gift_premium: true,
    creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    responsive_web_graphql_timeline_navigation_enabled: true,
};

const TWEET_RESULT_FEATURES = {
    creator_subscriptions_tweet_preview_api_enabled: true,
    communities_web_enable_tweet_community_results_fetch: true,
    c9s_tweet_anatomy_moderator_badge_enabled: true,
    articles_preview_enabled: true,
    responsive_web_edit_tweet_api_enabled: true,
    graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
    view_counts_everywhere_api_enabled: true,
    longform_notetweets_consumption_enabled: true,
    responsive_web_twitter_article_tweet_consumption_enabled: true,
    tweet_awards_web_tipping_enabled: false,
    creator_subscriptions_quote_tweet_preview_enabled: false,
    freedom_of_speech_not_reach_fetch_enabled: true,
    standardized_nudges_misinfo: true,
    tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
    rweb_video_timestamps_enabled: true,
    longform_notetweets_rich_text_read_enabled: true,
    longform_notetweets_inline_media_enabled: true,
    rweb_tipjar_consumption_enabled: true,
    responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    responsive_web_graphql_timeline_navigation_enabled: true,
    responsive_web_text_conversations_enabled: false,
    responsive_web_enhance_cards_enabled: false,
};

const USER_TWEETS_FEATURES = {
    rweb_tipjar_consumption_enabled: true,
    responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false,
    creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_timeline_navigation_enabled: true,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    communities_web_enable_tweet_community_results_fetch: true,
    c9s_tweet_anatomy_moderator_badge_enabled: true,
    articles_preview_enabled: true,
    rweb_recipe_iteration_enable: false,
    articles_preview_tweet_card_ui_enabled: true,
    responsive_web_twitter_article_tweet_consumption_enabled: true,
    tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
    longform_notetweets_inline_media_enabled: true,
    longform_notetweets_rich_text_read_enabled: true,
    longform_notetweets_consumption_enabled: true,
    responsive_web_twitter_article_notes_tab_enabled: true,
    freedom_of_speech_not_reach_fetch_enabled: true,
    standardized_nudges_misinfo: true,
    view_counts_everywhere_api_enabled: true,
    responsive_web_edit_tweet_api_enabled: true,
    graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
    highlights_tweets_tab_ui_enabled: true,
    subscriptions_feature_can_gift_premium: true,
    subscriptions_verification_info_is_identity_verified_enabled: true,
    subscriptions_verification_info_verified_since_enabled: true,
    creator_subscriptions_quote_tweet_preview_enabled: false,
    tweet_awards_web_tipping_enabled: false,
    responsive_web_text_conversations_enabled: false,
    responsive_web_enhance_cards_enabled: false,
};

function randomHex(bytes: number): string {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const arr = new Uint8Array(bytes);
        crypto.getRandomValues(arr);
        return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback: Math.random is fine for csrf tokens (they don't need to be
    // cryptographically secure — Twitter just echoes what we send).
    let out = '';
    for (let i = 0; i < bytes; i++) {
        out += Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    }
    return out;
}

export class GraphQLProvider {
    readonly name = 'graphql';
    protected readonly timeoutMs: number;
    protected readonly headers: Record<string, string>;
    protected guestToken?: string;
    protected guestTokenExpiresAt = 0;
    protected readonly guestTokenTtlSec: number;

    constructor(opts: GraphQLProviderOptions = {}) {
        this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        this.headers = { ...GRAPHQL_HEADERS };
        if (opts.userAgent) {
            this.headers['User-Agent'] = opts.userAgent;
        }
        this.guestToken = opts.guestToken;
        this.guestTokenTtlSec = opts.guestTokenTtlSec ?? 3600;
    }

    async fetchProfile(handle: string): Promise<User> {
        handle = handle.replace(/^@/, '');
        const qid = GRAPHQL_QUERIES.UserByScreenName;
        const variables = { screen_name: handle, withSafetyModeUserFields: true };
        const features = USER_BY_SCREEN_NAME_FEATURES;
        const data = await this.gqlGet(qid, { variables, features });
        let userObj = data?.data?.user?.result ?? {};
        if (userObj.legacy) {
            userObj = { ...userObj, ...userObj.legacy };
        }
        if (!userObj || !Object.keys(userObj).length) {
            throw new BlitzyxscNotFoundError(
                `GraphQL UserByScreenName returned no user for @${handle}`,
            );
        }
        return parseGraphqlUser(userObj);
    }

    async fetchStatus(tweetId: string): Promise<Tweet> {
        const qid = GRAPHQL_QUERIES.TweetResultByRestId;
        const variables = {
            tweetId: String(tweetId),
            withCommunity: false,
            includePromotedContent: false,
            withVoice: false,
        };
        const features = TWEET_RESULT_FEATURES;
        const data = await this.gqlGet(qid, { variables, features });
        const result = data?.data?.tweetResult?.result;
        if (!result) {
            throw new BlitzyxscNotFoundError(
                `GraphQL TweetResultByRestId returned no tweet for ${tweetId}`,
            );
        }
        return parseGraphqlTweet(result);
    }

    async fetchTimeline(handle: string, limit = 20): Promise<Tweet[]> {
        const user = await this.fetchProfile(handle);
        if (!user.id) {
            throw new BlitzyxscNotFoundError(
                `Cannot resolve user_id for @${handle} to fetch timeline`,
            );
        }
        const qid = GRAPHQL_QUERIES.UserTweets;
        const variables = {
            userId: user.id,
            count: Math.min(limit, 50),
            includePromotedContent: false,
            withQuickPromoteEligibilityTweetFields: false,
            withVoice: false,
            withV2Timeline: true,
        };
        const features = USER_TWEETS_FEATURES;
        const data = await this.gqlGet(qid, { variables, features });
        const instructions =
            data?.data?.user?.result?.timeline?.timeline?.instructions ?? [];
        const entries = extractEntries(instructions);
        const tweets: Tweet[] = [];
        for (const entry of entries) {
            const tweetObj =
                entry?.content?.itemContent?.tweet_results?.result;
            if (tweetObj) {
                try {
                    tweets.push(parseGraphqlTweet(tweetObj));
                } catch {
                    // skip malformed entries
                }
            }
            if (tweets.length >= limit) break;
        }
        return tweets;
    }

    async fetchReplies(_tweetId: string): Promise<never> {
        throw new BlitzyxscAuthError(
            'ConversationTimeline requires an authenticated Twitter account ' +
            '(guest token does not work). Use the FxTwitter provider for replies.',
        );
    }

    async search(_query: string, _limit = 20): Promise<never> {
        throw new BlitzyxscAuthError(
            'SearchTimeline requires an authenticated Twitter account ' +
            '(guest token does not work). Use the FxTwitter typeahead endpoint ' +
            'for user search only.',
        );
    }

    protected async getGuestToken(): Promise<string> {
        if (this.guestToken && Date.now() < this.guestTokenExpiresAt) {
            return this.guestToken;
        }
        const csrf = randomHex(16);
        const headers: Record<string, string> = {
            ...this.headers,
            'x-csrf-token': csrf,
            Cookie: `guest_id=v1%3A${csrf}; ct0=${csrf}; `,
        };
        const resp = await httpPost(TWITTER_GUEST_ACTIVATE_URL, {
            headers,
            timeoutMs: this.timeoutMs,
            provider: this.name,
        });
        let data: any;
        try {
            data = JSON.parse(resp.body);
        } catch (e: any) {
            throw new BlitzyxscParseError(
                `Could not parse guest_activate response: ${e.message}`,
                { raw: resp.body.slice(0, 500), provider: this.name },
            );
        }
        const token = data.guest_token;
        if (!token) {
            throw new BlitzyxscAuthError(
                `Twitter guest/activate.json did not return a guest_token: ${JSON.stringify(data)}`,
                { provider: this.name },
            );
        }
        this.guestToken = token;
        this.guestTokenExpiresAt = Date.now() + this.guestTokenTtlSec * 1000;
        return token;
    }

    protected async gqlGet(
        queryId: string,
        { variables, features }: { variables: Record<string, unknown>; features: Record<string, unknown> },
    ): Promise<any> {
        // Block queries that need an account.
        for (const [name, qid] of Object.entries(GRAPHQL_QUERIES)) {
            if (qid === queryId && REQUIRES_ACCOUNT_QUERIES.has(name)) {
                throw new BlitzyxscAuthError(
                    `GraphQL query ${name} requires an authenticated account ` +
                    `(guest tokens are not accepted by Twitter for this endpoint).`,
                );
            }
        }

        const url = `${TWITTER_GRAPHQL_API_BASE}/${queryId}`;
        const guestToken = await this.getGuestToken();
        const csrf = randomHex(16);
        const headers: Record<string, string> = {
            ...this.headers,
            'x-guest-token': guestToken,
            'x-csrf-token': csrf,
            Cookie: `guest_id=v1%3A${guestToken}; ct0=${csrf}; `,
        };
        const params = {
            variables: JSON.stringify(variables),
            features: JSON.stringify(features),
        };
        const resp = await httpGet(url, {
            params,
            headers,
            timeoutMs: this.timeoutMs,
            provider: this.name,
        });
        if (!resp.body) {
            throw new BlitzyxscNotFoundError(
                `GraphQL query ${queryId} returned empty body ` +
                '(query ID may have rotated — update GRAPHQL_QUERIES in constants.ts)',
                { statusCode: resp.statusCode, url: resp.url, provider: this.name },
            );
        }
        let data: any;
        try {
            data = JSON.parse(resp.body);
        } catch (e: any) {
            throw new BlitzyxscParseError(
                `GraphQL query ${queryId} returned non-JSON: ${e.message}`,
                { raw: resp.body.slice(0, 500), url: resp.url, provider: this.name },
            );
        }
        if (data && data.errors) {
            const errs = data.errors;
            const first = errs[0] ?? {};
            const msg = first.message ?? JSON.stringify(errs);
            const code = first.code;
            if (code === 88 || /Rate limit/i.test(String(msg))) {
                throw new BlitzyxscRateLimitError(
                    `Twitter GraphQL rate-limited ${queryId}: ${msg}`,
                    { url: resp.url, provider: this.name },
                );
            }
            if (/Could not authenticate|Unauthorized/i.test(String(msg))) {
                throw new BlitzyxscAuthError(
                    `GraphQL auth error for ${queryId}: ${msg}`,
                    { url: resp.url, provider: this.name },
                );
            }
        }
        return data;
    }
}

function extractEntries(instructions: any[]): any[] {
    const out: any[] = [];
    for (const instr of instructions ?? []) {
        if (instr?.type === 'TimelineAddEntries') {
            out.push(...(instr.entries ?? []));
        } else if (instr?.type === 'TimelineAddToModule') {
            out.push(...((instr.moduleItems ?? {}).entries ?? []));
        }
    }
    return out;
}

function parseGraphqlUser(obj: any): User {
    const legacy = obj.legacy || obj || {};
    const avatar = legacy.profile_image_url_https ?? legacy.profile_image_url;
    return {
        id: String(obj.rest_id ?? legacy.id_str ?? obj.id ?? ''),
        screenName: legacy.screen_name ?? '',
        name: legacy.name,
        description: legacy.description,
        location: legacy.location,
        url: legacy.url,
        followers: legacy.followers_count,
        following: legacy.friends_count ?? legacy.following_count,
        likes: legacy.favourites_count,
        tweets: legacy.statuses_count,
        mediaCount: legacy.media_count,
        avatarUrl: avatar,
        bannerUrl: legacy.profile_banner_url,
        joined: legacy.created_at,
        protected: legacy.protected,
        verified: obj.is_blue_verified ?? obj.verified ?? legacy.verified,
        verificationType: obj.is_blue_verified ? 'blue'
            : (legacy.verified ? 'legacy' : undefined),
    };
}

function parseGraphqlTweet(obj: any): Tweet {
    const legacy = obj.legacy || obj || {};
    const userObj = obj?.core?.user_results?.result ?? {};
    const author = userObj ? parseGraphqlUser(userObj) : undefined;

    let views: number | undefined;
    if (legacy.ext && typeof legacy.ext === 'object') {
        const viewsResp = legacy.ext.views ?? {};
        if (typeof viewsResp === 'object' && viewsResp.count != null) {
            const n = Number(viewsResp.count);
            views = Number.isNaN(n) ? undefined : n;
        }
    }

    return {
        id: String(obj.rest_id ?? legacy.id_str ?? ''),
        text: legacy.full_text ?? legacy.text,
        author,
        createdAt: legacy.created_at,
        replyCount: legacy.reply_count,
        quoteCount: legacy.quote_count,
        retweetCount: legacy.retweet_count,
        favoriteCount: legacy.favorite_count,
        bookmarkCount: legacy.bookmark_count,
        views,
        language: legacy.lang,
        inReplyToStatusId: legacy.in_reply_to_status_id_str != null
            ? String(legacy.in_reply_to_status_id_str) : undefined,
        inReplyToUserId: legacy.in_reply_to_user_id_str != null
            ? String(legacy.in_reply_to_user_id_str) : undefined,
        inReplyToScreenName: legacy.in_reply_to_screen_name,
        conversationId: legacy.conversation_id_str != null
            ? String(legacy.conversation_id_str) : undefined,
        isQuoteStatus: Boolean(legacy.is_quote_status),
        isRetweet: Boolean(legacy.retweeted_status_result),
        isReply: Boolean(
            legacy.in_reply_to_status_id_str || legacy.in_reply_to_screen_name,
        ),
        isThread: false,
        sensitive: false,
        nsfw: false,
        mentions: [],
        hashtags: [],
        urls: [],
        media: [],
        raw: obj,
    };
}

export { parseGraphqlUser, parseGraphqlTweet };
