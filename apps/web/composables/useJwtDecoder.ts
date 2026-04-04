export interface JwtHeader {
    alg?: string;
    typ?: string;
    [key: string]: unknown;
}

export interface JwtPayload {
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
    [key: string]: unknown;
}

export interface DecodedJwt {
    header: JwtHeader;
    payload: JwtPayload;
    signature: string;
    rawParts: [string, string, string];
}

export interface TimestampInfo {
    unix: number;
    date: Date;
    humanReadable: string;
    relative: string;
}

export type SecuritySeverity = "critical" | "warning";

export interface SecurityWarning {
    severity: SecuritySeverity;
    title: string;
    description: string;
}

export interface JwtError {
    message: string;
}

const STORAGE_KEY = "jwt-decoder-token";

const TIMESTAMP_CLAIMS = new Set(["iat", "exp", "nbf", "auth_time", "updated_at"]);

const STANDARD_CLAIMS: Record<string, string> = {
    iss: "Issuer — identifies the principal that issued the JWT",
    sub: "Subject — identifies the principal that is the subject of the JWT",
    aud: "Audience — identifies the recipients that the JWT is intended for",
    exp: "Expiration Time — the time after which the JWT must not be accepted",
    nbf: "Not Before — the time before which the JWT must not be accepted",
    iat: "Issued At — the time at which the JWT was issued",
    jti: "JWT ID — a unique identifier for the JWT",
    azp: "Authorized Party — the party to which the token was issued",
    scope: "Scope — the permissions associated with the token",
    nonce: "Nonce — a value used to associate a client session with a token",
    at_hash: "Access Token Hash — hash of the access token",
    c_hash: "Code Hash — hash of the authorization code",
    auth_time: "Authentication Time — the time when the end-user authentication occurred",
    acr: "Authentication Context Class Reference",
    amr: "Authentication Methods References",
    name: "Full Name — the user's full name",
    email: "Email — the user's email address",
    email_verified: "Email Verified — whether the email has been verified",
    roles: "Roles — the roles assigned to the user",
    permissions: "Permissions — the permissions granted to the user",
};

const NONE_ALGORITHMS = new Set(["none", "None", "NONE", "nOnE"]);

function base64UrlDecode(str: string): string {
    // Replace base64url characters with base64 equivalents
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    // Pad with '=' to make length a multiple of 4
    const pad = base64.length % 4;
    if (pad) {
        base64 += "=".repeat(4 - pad);
    }
    try {
        return decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
                .join(""),
        );
    } catch {
        // Fallback for non-UTF8 content
        return atob(base64);
    }
}

function formatTimestamp(unix: number): TimestampInfo {
    const date = new Date(unix * 1000);
    const humanReadable = date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
    });
    const relative = getRelativeTime(date);
    return { unix, date, humanReadable, relative };
}

function getRelativeTime(date: Date): string {
    const now = Date.now();
    const diff = date.getTime() - now;
    const absDiff = Math.abs(diff);

    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    let unit: string;
    let value: number;

    if (years > 0) {
        unit = "year";
        value = years;
    } else if (months > 0) {
        unit = "month";
        value = months;
    } else if (days > 0) {
        unit = "day";
        value = days;
    } else if (hours > 0) {
        unit = "hour";
        value = hours;
    } else if (minutes > 0) {
        unit = "minute";
        value = minutes;
    } else {
        unit = "second";
        value = seconds;
    }

    const plural = value !== 1 ? "s" : "";

    if (diff < 0) {
        return `${value} ${unit}${plural} ago`;
    }
    return `in ${value} ${unit}${plural}`;
}

function getSecurityWarnings(header: JwtHeader): SecurityWarning[] {
    const warnings: SecurityWarning[] = [];
    const alg = header.alg;

    if (alg && NONE_ALGORITHMS.has(alg)) {
        warnings.push({
            severity: "critical",
            title: 'Algorithm "none" detected',
            description:
                "This token has no cryptographic signature. It can be trivially forged by anyone. Never trust unsigned tokens in production.",
        });
    } else if (alg === "HS256") {
        warnings.push({
            severity: "warning",
            title: "Symmetric algorithm (HS256)",
            description:
                "HS256 uses a shared secret for signing and verification. If the secret is weak or shared across services, tokens can be forged. Consider RS256 or ES256 for better security.",
        });
    }

    if (header.jku) {
        warnings.push({
            severity: "warning",
            title: "JKU header present",
            description:
                "The token specifies a JWK Set URL (jku). If not properly validated, an attacker could point this to their own key set.",
        });
    }

    if (header.x5u) {
        warnings.push({
            severity: "warning",
            title: "X5U header present",
            description:
                "The token specifies an X.509 certificate URL (x5u). If not properly validated, this could be exploited to substitute a malicious certificate.",
        });
    }

    return warnings;
}

export function useJwtDecoder() {
    const token = ref("");
    const decoded = ref<DecodedJwt | null>(null);
    const error = ref<JwtError | null>(null);
    const securityWarnings = ref<SecurityWarning[]>([]);
    const timestamps = ref<Record<string, TimestampInfo>>({});
    const expiryStatus = ref<{ expired: boolean; label: string } | null>(null);

    // --- Session storage ---
    function saveState() {
        if (import.meta.server) return;
        try {
            sessionStorage.setItem(STORAGE_KEY, token.value);
        } catch {
            // Ignore quota errors
        }
    }

    function restoreState() {
        if (import.meta.server) return;
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (saved) token.value = saved;
        } catch {
            // Ignore
        }
    }

    // --- Core decoding ---
    function decode() {
        const raw = token.value.trim();
        if (!raw) {
            decoded.value = null;
            error.value = null;
            securityWarnings.value = [];
            timestamps.value = {};
            expiryStatus.value = null;
            saveState();
            return;
        }

        const parts = raw.split(".");
        if (parts.length !== 3) {
            decoded.value = null;
            error.value = {
                message: `Invalid JWT structure: expected 3 parts separated by dots, found ${parts.length}`,
            };
            securityWarnings.value = [];
            timestamps.value = {};
            expiryStatus.value = null;
            saveState();
            return;
        }

        const [headerB64, payloadB64, signatureB64] = parts;

        try {
            const headerJson = base64UrlDecode(headerB64);
            const header: JwtHeader = JSON.parse(headerJson);

            let payload: JwtPayload;
            try {
                const payloadJson = base64UrlDecode(payloadB64);
                payload = JSON.parse(payloadJson);
            } catch {
                decoded.value = null;
                error.value = {
                    message: "Failed to decode payload: invalid base64url or malformed JSON",
                };
                securityWarnings.value = [];
                timestamps.value = {};
                expiryStatus.value = null;
                saveState();
                return;
            }

            decoded.value = {
                header,
                payload,
                signature: signatureB64,
                rawParts: [headerB64, payloadB64, signatureB64],
            };
            error.value = null;

            // Process timestamps
            const tsMap: Record<string, TimestampInfo> = {};
            for (const [key, value] of Object.entries(payload)) {
                if (TIMESTAMP_CLAIMS.has(key) && typeof value === "number") {
                    tsMap[key] = formatTimestamp(value);
                }
            }
            timestamps.value = tsMap;

            // Expiry status
            if (typeof payload.exp === "number") {
                const now = Math.floor(Date.now() / 1000);
                const expired = payload.exp < now;
                const tsInfo = formatTimestamp(payload.exp);
                expiryStatus.value = {
                    expired,
                    label: expired
                        ? `Expired ${tsInfo.relative}`
                        : `Valid for ${tsInfo.relative.replace("in ", "")}`,
                };
            } else {
                expiryStatus.value = null;
            }

            // Security warnings
            securityWarnings.value = getSecurityWarnings(header);
        } catch {
            decoded.value = null;
            error.value = {
                message: "Failed to decode header: invalid base64url or malformed JSON",
            };
            securityWarnings.value = [];
            timestamps.value = {};
            expiryStatus.value = null;
        }

        saveState();
    }

    // Debounced watcher
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    watch(token, () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(decode, 150);
    });

    function clear() {
        token.value = "";
        decoded.value = null;
        error.value = null;
        securityWarnings.value = [];
        timestamps.value = {};
        expiryStatus.value = null;
        saveState();
    }

    function isTimestampClaim(key: string): boolean {
        return TIMESTAMP_CLAIMS.has(key);
    }

    function getClaimDescription(key: string): string | undefined {
        return STANDARD_CLAIMS[key];
    }

    function isStandardClaim(key: string): boolean {
        return key in STANDARD_CLAIMS;
    }

    // Restore on mount
    onMounted(() => {
        restoreState();
        if (token.value.trim()) {
            decode();
        }
    });

    onUnmounted(() => {
        if (debounceTimer) clearTimeout(debounceTimer);
    });

    return {
        token,
        decoded,
        error,
        securityWarnings,
        timestamps,
        expiryStatus,
        clear,
        isTimestampClaim,
        getClaimDescription,
        isStandardClaim,
    };
}
