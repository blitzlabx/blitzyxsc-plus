/**
 * blitzyxsc.client — top-level client orchestrating all providers.
 */

import {
    DEFAULT_PROVIDERS,
    DEFAULT_TIMEOUT_MS,
    DEFAULT_RETRY,
} from './constants';
import {
    BlitzyxscError,
    BlitzyxscAuthError,
    BlitzyxscNotFoundError,
} from './exceptions';
import { FxTwitterProvider } from './fxtwitter';
import { GraphQLProvider } from './graphql';
import { SyndicationProvider } from './syndication';
import type {
    Conversation, ProfileAbout, Thread, Trend, Tweet, User,
} from './models';
import { parseTweet } from './fxtwitter';
import type { ProviderName } from './constants';

export interface BlitzyxscOptions {
    providers?: ProviderName[];
    timeoutMs?: number;
    userAgent?: string;
    retry?: number;
}

type AnyProvider = FxTwitterProvider | SyndicationProvider | GraphQLProvider;

export class Blitzyxsc {
    readonly providersOrder: ProviderName[];
    protected readonly timeoutMs: number;
    protected readonly userAgent?: string;
    protected readonly retry: number;
    protected instances: Partial<Record<ProviderName, AnyProvider>> = {};

    constructor(opts: BlitzyxscOptions = {}) {
        this.providersOrder = opts.providers
            ? [...opts.providers]
            : [...DEFAULT_PROVIDERS];
        this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        this.userAgent = opts.userAgent;
        this.retry = opts.retry ?? DEFAULT_RETRY;
    }

    protected provider<N extends ProviderName>(name: N): AnyProvider {
        if (!this.instances[name]) {
            const opts = { timeoutMs: this.timeoutMs, userAgent: this.userAgent };
            switch (name) {
                case 'fxtwitter':
                    this.instances[name] = new FxTwitterProvider(opts);
                    break;
                case 'syndication':
                    this.instances[name] = new SyndicationProvider(opts);
                    break;
                case 'graphql':
                    this.instances[name] = new GraphQLProvider(opts);
                    break;
                default:
                    throw new Error(`Unknown provider: ${name}`);
            }
        }
        return this.instances[name]!;
    }

    protected async run<T>(
        methodName: string,
        args: any[] = [],
        only?: ProviderName[],
    ): Promise<T> {
        const candidates = only ? [...only] : [...this.providersOrder];
        let lastErr: Error | null = null;
        for (const name of candidates) {
            const provider = this.provider(name);
            const fn = (provider as any)[methodName];
            if (typeof fn !== 'function') continue;
            try {
                return await fn.apply(provider, args);
            } catch (err) {
                if (err instanceof BlitzyxscAuthError) throw err;
                lastErr = err as Error;
                continue;
            }
        }
        if (lastErr) throw lastErr;
        throw new BlitzyxscError(
            `No provider in ${JSON.stringify(candidates)} implemented ${methodName}`,
        );
    }

    // --- Public API ---------------------------------------------------

    fetchProfile(handle: string): Promise<User> {
        const only: ProviderName[] = this.providersOrder.includes('graphql')
            ? ['fxtwitter', 'graphql']
            : ['fxtwitter'];
        return this.run<User>('fetchProfile', [handle], only);
    }

    fetchStatus(tweetId: string): Promise<Tweet> {
        return this.run<Tweet>('fetchStatus', [String(tweetId)]);
    }

    fetchTimeline(handle: string, limit = 20): Promise<Tweet[]> {
        const only: ProviderName[] = this.providersOrder.includes('graphql')
            ? ['fxtwitter', 'graphql']
            : ['fxtwitter'];
        return this.run<Tweet[]>('fetchTimeline', [handle, limit], only);
    }

    fetchMedia(handle: string, limit = 20): Promise<Tweet[]> {
        return this.run<Tweet[]>('fetchMedia', [handle, limit], ['fxtwitter']);
    }

    async fetchReplies(tweetId: string): Promise<Conversation> {
        const result = await this.run<any>(
            'fetchConversation', [String(tweetId)], ['fxtwitter'],
        );
        return {
            root: result.root,
            thread: result.thread || [],
            replies: result.replies || [],
            author: result.author,
            cursorTop: result.cursorTop,
            cursorBottom: result.cursorBottom,
        };
    }

    fetchConversation(tweetId: string): Promise<Conversation> {
        return this.fetchReplies(tweetId);
    }

    async fetchThread(tweetId: string): Promise<Thread> {
        const result = await this.run<any>(
            'fetchThread', [String(tweetId)], ['fxtwitter'],
        );
        return { root: result.root, tweets: result.tweets || [] };
    }

    fetchTrends(): Promise<Trend[]> {
        return this.run<Trend[]>('fetchTrends', [], ['fxtwitter']);
    }

    fetchFollowers(handle: string, limit = 20): Promise<User[]> {
        return this.run<User[]>('fetchFollowers', [handle, limit], ['fxtwitter']);
    }

    fetchFollowing(handle: string, limit = 20): Promise<User[]> {
        return this.run<User[]>('fetchFollowing', [handle, limit], ['fxtwitter']);
    }

    fetchAbout(handle: string): Promise<ProfileAbout> {
        return this.run<ProfileAbout>('fetchAbout', [handle], ['fxtwitter']);
    }

    fetchReposts(tweetId: string): Promise<User[]> {
        return this.run<User[]>('fetchReposts', [String(tweetId)], ['fxtwitter']);
    }

    searchUsers(query: string): Promise<User[]> {
        return this.run<User[]>('searchUsers', [query], ['fxtwitter']);
    }

    async fetchMentions(handle: string, limit = 20): Promise<Tweet[]> {
        // Best-effort: return the user's recent replies (each is a mention of
        // its parent tweet's author).
        try {
            const provider = this.provider('fxtwitter') as FxTwitterProvider;
            const data = await (provider as any).getJson(
                `/2/profile/${handle.replace(/^@/, '')}/statuses`,
                { limit: String(limit * 2) },
            );
            const statuses = data.results || data.statuses || data.timeline || [];
            const tweets = statuses.filter(Boolean).map(parseTweet);
            return tweets.filter((t: Tweet) => t.isReply).slice(0, limit);
        } catch (err) {
            if (err instanceof BlitzyxscAuthError) throw err;
            return [];
        }
    }
}

// Alias so both `Blitzyxsc` and `BlitzyxscClient` work.
export const BlitzyxscClient = Blitzyxsc;
