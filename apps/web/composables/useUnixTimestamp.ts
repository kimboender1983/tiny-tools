export type TimestampUnit = "seconds" | "milliseconds";
export type ConvertDirection = "toDate" | "toTimestamp";

export interface ParsedDate {
    local: string;
    utc: string;
    iso: string;
    relative: string;
    dayOfWeek: string;
    dayOfYear: number;
    weekNumber: number;
    isLeapYear: boolean;
    unixSeconds: number;
    unixMilliseconds: number;
    date: Date;
}

export interface TimezoneEntry {
    id: string;
    label: string;
    city: string;
    abbr: string;
    offset: string;
    time: string;
    date: string;
}

export const TIMEZONES = [
    { id: "Pacific/Auckland", label: "NZST", city: "Auckland" },
    { id: "Australia/Sydney", label: "AEST", city: "Sydney" },
    { id: "Asia/Tokyo", label: "JST", city: "Tokyo" },
    { id: "Asia/Shanghai", label: "CST", city: "Shanghai" },
    { id: "Asia/Kolkata", label: "IST", city: "Mumbai" },
    { id: "Asia/Dubai", label: "GST", city: "Dubai" },
    { id: "Europe/Moscow", label: "MSK", city: "Moscow" },
    { id: "Europe/Istanbul", label: "TRT", city: "Istanbul" },
    { id: "Europe/Amsterdam", label: "CET", city: "Amsterdam" },
    { id: "Europe/Berlin", label: "CET", city: "Berlin" },
    { id: "Europe/London", label: "GMT", city: "London" },
    { id: "America/Sao_Paulo", label: "BRT", city: "São Paulo" },
    { id: "America/New_York", label: "EST", city: "New York" },
    { id: "America/Chicago", label: "CST", city: "Chicago" },
    { id: "America/Denver", label: "MST", city: "Denver" },
    { id: "America/Los_Angeles", label: "PST", city: "Los Angeles" },
    { id: "Pacific/Honolulu", label: "HST", city: "Honolulu" },
];

export interface TimestampError {
    message: string;
}

const STORAGE_KEY = "unix-timestamp-state";

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
    return diff < 0 ? `${value} ${unit}${plural} ago` : `in ${value} ${unit}${plural}`;
}

function getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function formatLocal(date: Date): string {
    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
    });
}

function formatUtc(date: Date): string {
    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
    });
}

export function useUnixTimestamp() {
    const input = ref("");
    const direction = ref<ConvertDirection>("toDate");
    const unit = ref<TimestampUnit>("seconds");
    const error = ref<TimestampError | null>(null);
    const parsed = ref<ParsedDate | null>(null);

    // Live "now" clock
    const now = ref(Date.now());
    let nowInterval: ReturnType<typeof setInterval> | null = null;

    const nowSeconds = computed(() => Math.floor(now.value / 1000));
    const nowMilliseconds = computed(() => now.value);

    // --- Session storage ---
    function saveState() {
        if (import.meta.server) return;
        try {
            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    input: input.value,
                    direction: direction.value,
                    unit: unit.value,
                }),
            );
        } catch {
            /* ignore */
        }
    }

    function restoreState() {
        if (import.meta.server) return;
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (raw) {
                const s = JSON.parse(raw);
                if (s.input != null) input.value = s.input;
                if (s.direction) direction.value = s.direction;
                if (s.unit) unit.value = s.unit;
            }
        } catch {
            /* ignore */
        }
    }

    // --- Processing ---
    function process() {
        const raw = input.value.trim();
        if (!raw) {
            parsed.value = null;
            error.value = null;
            saveState();
            return;
        }

        if (direction.value === "toDate") {
            // Timestamp → Date
            const num = Number(raw);
            if (Number.isNaN(num)) {
                error.value = { message: "Invalid timestamp. Enter a numeric Unix timestamp." };
                parsed.value = null;
                saveState();
                return;
            }

            const ms = unit.value === "seconds" ? num * 1000 : num;
            const date = new Date(ms);

            if (Number.isNaN(date.getTime())) {
                error.value = { message: "Timestamp out of range." };
                parsed.value = null;
                saveState();
                return;
            }

            buildParsed(date);
            error.value = null;
        } else {
            // Date string → Timestamp
            const date = new Date(raw);
            if (Number.isNaN(date.getTime())) {
                error.value = {
                    message:
                        'Invalid date. Try formats like "2026-04-03", "Apr 3 2026 14:30", or ISO 8601.',
                };
                parsed.value = null;
                saveState();
                return;
            }

            buildParsed(date);
            error.value = null;
        }

        saveState();
    }

    function buildParsed(date: Date) {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        parsed.value = {
            local: formatLocal(date),
            utc: formatUtc(date),
            iso: date.toISOString(),
            relative: getRelativeTime(date),
            dayOfWeek: days[date.getDay()],
            dayOfYear: getDayOfYear(date),
            weekNumber: getWeekNumber(date),
            isLeapYear: isLeapYear(date.getFullYear()),
            unixSeconds: Math.floor(date.getTime() / 1000),
            unixMilliseconds: date.getTime(),
            date,
        };
    }

    function formatInTimezone(date: Date, tz: string): TimezoneEntry {
        const tzDef = TIMEZONES.find((t) => t.id === tz) || { id: tz, label: tz, city: tz };
        try {
            const time = date.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZone: tz,
            });
            const dateStr = date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                timeZone: tz,
            });
            const parts = new Intl.DateTimeFormat("en-US", {
                timeZone: tz,
                timeZoneName: "shortOffset",
            }).formatToParts(date);
            const offsetPart = parts.find((p) => p.type === "timeZoneName");
            const offset = offsetPart?.value || "";
            const abbrParts = new Intl.DateTimeFormat("en-US", {
                timeZone: tz,
                timeZoneName: "short",
            }).formatToParts(date);
            const abbr = abbrParts.find((p) => p.type === "timeZoneName")?.value || tzDef.label;

            return {
                id: tz,
                label: tzDef.label,
                city: tzDef.city,
                abbr,
                offset,
                time,
                date: dateStr,
            };
        } catch {
            return {
                id: tz,
                label: tzDef.label,
                city: tzDef.city,
                abbr: "",
                offset: "",
                time: "—",
                date: "—",
            };
        }
    }

    const timezoneResults = computed<TimezoneEntry[]>(() => {
        if (!parsed.value) return [];
        return TIMEZONES.map((tz) => formatInTimezone(parsed.value?.date, tz.id));
    });

    // Debounced watcher
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    watch([input, direction, unit], () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(process, 100);
    });

    function useNow() {
        direction.value = "toDate";
        unit.value = "seconds";
        input.value = String(Math.floor(Date.now() / 1000));
    }

    function clear() {
        input.value = "";
        parsed.value = null;
        error.value = null;
        saveState();
    }

    onMounted(() => {
        restoreState();
        if (input.value.trim()) process();
        nowInterval = setInterval(() => {
            now.value = Date.now();
        }, 1000);
    });

    onUnmounted(() => {
        if (debounceTimer) clearTimeout(debounceTimer);
        if (nowInterval) clearInterval(nowInterval);
    });

    return {
        input,
        direction,
        unit,
        error,
        parsed,
        now,
        nowSeconds,
        nowMilliseconds,
        timezoneResults,
        useNow,
        clear,
    };
}
