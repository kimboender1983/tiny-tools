export default defineNuxtRouteMiddleware(async (to) => {
    // Only guard /admin/* routes, but not the login page itself
    if (!to.path.startsWith("/admin") || to.path === "/admin/login") {
        return;
    }

    const { isAuthenticated, init } = useAuth();

    if (!isAuthenticated.value) {
        return navigateTo("/admin/login", { replace: true });
    }

    // Validate the token is still valid by fetching the user
    // init() calls fetchUser() which auto-logouts on 401
    await init();

    // Re-check after validation — token may have been cleared
    if (!isAuthenticated.value) {
        return navigateTo("/admin/login", { replace: true });
    }
});
