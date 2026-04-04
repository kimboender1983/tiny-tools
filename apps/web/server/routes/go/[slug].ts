export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, "slug");
    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: "Missing slug" });
    }

    const config = useRuntimeConfig();
    const apiUrl = (config.public.apiUrl as string) || "http://localhost:3001";

    // Forward headers for tracking
    const headers: Record<string, string> = {};
    const referer = getRequestHeader(event, "referer");
    if (referer) headers.referer = referer;
    const ua = getRequestHeader(event, "user-agent");
    if (ua) headers["user-agent"] = ua;
    const xff = getRequestHeader(event, "x-forwarded-for");
    if (xff) headers["x-forwarded-for"] = xff;

    try {
        // Use native fetch to handle redirects manually
        const response = await fetch(`${apiUrl}/go/${slug}`, {
            headers,
            redirect: "manual",
        });

        const location = response.headers.get("location");
        if (location) {
            return sendRedirect(event, location, 302);
        }

        // If the API returned a non-redirect response, check for error
        if (response.status === 404) {
            throw createError({ statusCode: 404, statusMessage: "Affiliate not found" });
        }

        throw createError({ statusCode: 502, statusMessage: "Unexpected response from API" });
    } catch (e: unknown) {
        if (e && typeof e === "object" && "statusCode" in e) throw e;
        throw createError({ statusCode: 502, statusMessage: "Failed to reach API" });
    }
});
