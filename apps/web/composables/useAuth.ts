interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

const authState = reactive({
  user: null as AuthUser | null,
  loading: false,
});

export function useAuth() {
  const api = useApi();
  const tokenCookie = useCookie('auth_token', {
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
  });

  const isAuthenticated = computed(() => !!tokenCookie.value);
  const user = computed(() => authState.user);
  const loading = computed(() => authState.loading);

  async function login(email: string, password: string) {
    authState.loading = true;
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });
      tokenCookie.value = response.accessToken;
      authState.user = response.user;
    } finally {
      authState.loading = false;
    }
  }

  function logout() {
    tokenCookie.value = null;
    authState.user = null;
    navigateTo('/admin/login');
  }

  async function fetchUser() {
    if (!tokenCookie.value) return;
    try {
      authState.user = await api.get<AuthUser>('/auth/me', {
        authenticated: true,
      });
    } catch {
      logout();
    }
  }

  async function init() {
    if (tokenCookie.value && !authState.user) {
      await fetchUser();
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    fetchUser,
    init,
  };
}
