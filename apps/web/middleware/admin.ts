export default defineNuxtRouteMiddleware((to) => {
  // Only guard /admin/* routes, but not the login page itself
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') {
    return;
  }

  const { isAuthenticated } = useAuth();

  if (!isAuthenticated.value) {
    return navigateTo('/admin/login', { replace: true });
  }
});
