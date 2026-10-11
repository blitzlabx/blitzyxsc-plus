/**
 * blitzyxsc.exceptions — typed error hierarchy.
 */

export type BlitzyxscErrorContext = {
    statusCode?: number;
    url?: string;
    raw?: string;
    provider?: string;
};

export class BlitzyxscError extends Error {
    readonly statusCode?: number;
    readonly url?: string;
    readonly raw?: string;
    readonly provider?: string;

    constructor(message: string, ctx: BlitzyxscErrorContext = {}) {
        super(message);
        this.name = 'BlitzyxscError';
        this.statusCode = ctx.statusCode;
        this.url = ctx.url;
        this.raw = ctx.raw;
        this.provider = ctx.provider;
        Object.setPrototypeOf(this, new.target.prototype);
    }

    toString(): string {
        let base = this.message;
        if (this.statusCode !== undefined) {
            base = `[HTTP ${this.statusCode}] ${base}`;
        }
        if (this.provider) {
            base = `[${this.provider}] ${base}`;
        }
        if (this.url) {
            base = `${base} (url: ${this.url})`;
        }
        return base;
    }
}

export class BlitzyxscAuthError extends BlitzyxscError {
    constructor(message: string, ctx: BlitzyxscErrorContext = {}) {
        super(message, ctx);
        this.name = 'BlitzyxscAuthError';
    }
}

export class BlitzyxscNotFoundError extends BlitzyxscError {
    constructor(message: string, ctx: BlitzyxscErrorContext = {}) {
        super(message, ctx);
        this.name = 'BlitzyxscNotFoundError';
    }
}

export class BlitzyxscRateLimitError extends BlitzyxscError {
    constructor(message: string, ctx: BlitzyxscErrorContext = {}) {
        super(message, ctx);
        this.name = 'BlitzyxscRateLimitError';
    }
}

export class BlitzyxscNetworkError extends BlitzyxscError {
    constructor(message: string, ctx: BlitzyxscErrorContext = {}) {
        super(message, ctx);
        this.name = 'BlitzyxscNetworkError';
    }
}

export class BlitzyxscParseError extends BlitzyxscError {
    constructor(message: string, ctx: BlitzyxscErrorContext = {}) {
        super(message, ctx);
        this.name = 'BlitzyxscParseError';
    }
}
