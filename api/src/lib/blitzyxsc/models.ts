/**
 * blitzyxsc.models — typed interfaces for everything blitzyxsc returns.
 */

export interface UrlEntity {
    url: string;
    displayUrl?: string;
    expandedUrl?: string;
    start?: number;
    end?: number;
}

export interface MentionEntity {
    username: string;
    userId?: string;
    name?: string;
    start?: number;
    end?: number;
}

export interface HashtagEntity {
    text: string;
    start?: number;
    end?: number;
}

export interface Media {
    type: 'photo' | 'video' | 'animated_gif' | string;
    url?: string;
    altText?: string;
    width?: number;
    height?: number;
    durationMs?: number;
    previewUrl?: string;
    variants: Array<Record<string, unknown>>;
}

export interface VerificationInfo {
    verified?: boolean;
    verifiedAt?: string | null;
    type?: string | null;
}

export interface User {
    id: string;
    screenName: string;
    name?: string;
    description?: string;
    rawDescription?: Record<string, unknown> | null;
    location?: string;
    url?: string;
    website?: { url: string; displayUrl?: string } | string | null;
    followers?: number;
    following?: number;
    likes?: number;
    tweets?: number;
    mediaCount?: number;
    avatarUrl?: string;
    bannerUrl?: string;
    joined?: string;
    protected?: boolean;
    verified?: boolean;
    verificationType?: string | null;
    verifiedAt?: string | null;
}

export interface Tweet {
    id: string;
    text?: string;
    author?: User;
    createdAt?: string;
    replyCount?: number;
    quoteCount?: number;
    retweetCount?: number;
    favoriteCount?: number;
    bookmarkCount?: number;
    views?: number | string | null;
    language?: string;
    inReplyToStatusId?: string;
    inReplyToUserId?: string;
    inReplyToScreenName?: string;
    conversationId?: string;
    isQuoteStatus: boolean;
    isRetweet: boolean;
    isReply: boolean;
    isThread: boolean;
    sensitive: boolean;
    nsfw: boolean;
    mentions: MentionEntity[];
    hashtags: HashtagEntity[];
    urls: UrlEntity[];
    media: Media[];
    quotedTweet?: Tweet | null;
    retweetedTweet?: Tweet | null;
    raw?: Record<string, unknown>;
}

export interface Conversation {
    root: Tweet | null;
    thread: Tweet[];
    replies: Tweet[];
    author: User | null;
    cursorTop?: string | null;
    cursorBottom?: string | null;
}

export interface Thread {
    root: Tweet | null;
    tweets: Tweet[];
}

export interface Trend {
    name: string;
    url?: string;
    tweetCount?: number;
    formattedTweetCount?: string;
    description?: string;
    raw?: Record<string, unknown>;
}

export interface ProfileAbout {
    id: string;
    screenName: string;
    location?: string;
    url?: string;
    description?: string;
    entities: Record<string, unknown>;
    raw?: Record<string, unknown>;
}
