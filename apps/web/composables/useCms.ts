import type { IAffiliate, IAuthor, IBlogPost, ICategory, IMedia, IPage, ITechLogo } from "@tiny-tools/shared";

interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

interface ListParams {
    page?: number;
    pageSize?: number;
    status?: string;
    category?: string;
    search?: string;
    template?: string;
}

const AUTH = { authenticated: true } as const;

export function useCms() {
    const api = useApi();

    const pages = {
        list: (params?: ListParams) =>
            api.get<PaginatedResponse<IPage>>("/cms/pages", { ...AUTH, params }),
        get: (idOrSlug: string) => api.get<IPage>(`/cms/pages/${idOrSlug}`, AUTH),
        create: (data: Partial<IPage>) => api.post<IPage>("/cms/pages", data, AUTH),
        update: (id: string, data: Partial<IPage>) =>
            api.put<IPage>(`/cms/pages/${id}`, data, AUTH),
        delete: (id: string) => api.delete<void>(`/cms/pages/${id}`, AUTH),
    };

    const blogPosts = {
        list: (params?: ListParams) =>
            api.get<PaginatedResponse<IBlogPost>>("/cms/blog-posts", { ...AUTH, params }),
        get: (idOrSlug: string) => api.get<IBlogPost>(`/cms/blog-posts/${idOrSlug}`, AUTH),
        create: (data: Partial<IBlogPost>) => api.post<IBlogPost>("/cms/blog-posts", data, AUTH),
        update: (id: string, data: Partial<IBlogPost>) =>
            api.put<IBlogPost>(`/cms/blog-posts/${id}`, data, AUTH),
        delete: (id: string) => api.delete<void>(`/cms/blog-posts/${id}`, AUTH),
        toggleFeatured: (id: string) =>
            api.patch<IBlogPost>(`/cms/blog-posts/${id}/featured`, {}, AUTH),
        toggleFeaturedHomepage: (id: string) =>
            api.patch<IBlogPost>(`/cms/blog-posts/${id}/featured-homepage`, {}, AUTH),
        toggleHomepageHero: (id: string) =>
            api.patch<IBlogPost>(`/cms/blog-posts/${id}/homepage-hero`, {}, AUTH),
    };

    const categories = {
        list: (params?: ListParams) =>
            api.get<PaginatedResponse<ICategory>>("/cms/categories", { ...AUTH, params }),
        get: (idOrSlug: string) => api.get<ICategory>(`/cms/categories/${idOrSlug}`, AUTH),
        create: (data: Partial<ICategory>) => api.post<ICategory>("/cms/categories", data, AUTH),
        update: (id: string, data: Partial<ICategory>) =>
            api.put<ICategory>(`/cms/categories/${id}`, data, AUTH),
        delete: (id: string) => api.delete<void>(`/cms/categories/${id}`, AUTH),
    };

    const media = {
        list: (params?: ListParams) =>
            api.get<PaginatedResponse<IMedia>>("/cms/media", { ...AUTH, params }),
        upload: (file: File, meta?: { alt?: string; caption?: string }) => {
            const formData = new FormData();
            formData.append("file", file);
            if (meta?.alt) formData.append("alt", meta.alt);
            if (meta?.caption) formData.append("caption", meta.caption);
            return api.post<IMedia>("/cms/media/upload", formData, AUTH);
        },
        replace: (id: string, file: Blob, filename: string) => {
            const formData = new FormData();
            formData.append("file", file, filename);
            return api.put<IMedia>(`/cms/media/${id}/replace`, formData, AUTH);
        },
        delete: (id: string) => api.delete<void>(`/cms/media/${id}`, AUTH),
    };

    const authors = {
        list: () => api.get<IAuthor[]>("/cms/authors", AUTH),
        get: (id: string) => api.get<IAuthor>(`/cms/authors/${id}`, AUTH),
        create: (data: Partial<IAuthor>) => api.post<IAuthor>("/cms/authors", data, AUTH),
        update: (id: string, data: Partial<IAuthor>) =>
            api.put<IAuthor>(`/cms/authors/${id}`, data, AUTH),
        delete: (id: string) => api.delete<void>(`/cms/authors/${id}`, AUTH),
    };

    const affiliates = {
        list: (params?: ListParams) =>
            api.get<PaginatedResponse<IAffiliate>>("/cms/affiliates", { ...AUTH, params }),
        get: (id: string) => api.get<IAffiliate>(`/cms/affiliates/${id}`, AUTH),
        create: (data: Partial<IAffiliate>) => api.post<IAffiliate>("/cms/affiliates", data, AUTH),
        update: (id: string, data: Partial<IAffiliate>) =>
            api.put<IAffiliate>(`/cms/affiliates/${id}`, data, AUTH),
        delete: (id: string) => api.delete<void>(`/cms/affiliates/${id}`, AUTH),
        getAnalytics: (id: string, days = 30) =>
            api.get<Record<string, unknown>>(`/cms/affiliates/${id}/analytics`, {
                ...AUTH,
                params: { days },
            }),
        getOverviewAnalytics: (days = 30) =>
            api.get<Record<string, unknown>>("/cms/affiliates/analytics/overview", {
                ...AUTH,
                params: { days },
            }),
    };

    interface CmsUser {
        _id: string;
        email: string;
        name?: string;
        role: string;
        plan: string;
        avatar?: string;
        createdAt: string;
        updatedAt: string;
    }

    const users = {
        list: () => api.get<CmsUser[]>("/cms/users", AUTH),
        get: (id: string) => api.get<CmsUser>(`/cms/users/${id}`, AUTH),
        create: (data: { email: string; password: string; name?: string; role?: string }) =>
            api.post<CmsUser>("/cms/users", data, AUTH),
        update: (
            id: string,
            data: { email?: string; name?: string; role?: string; plan?: string; avatar?: string },
        ) => api.put<CmsUser>(`/cms/users/${id}`, data, AUTH),
        changePassword: (id: string, password: string) =>
            api.patch<void>(`/cms/users/${id}/password`, { password }, AUTH),
        delete: (id: string) => api.delete<void>(`/cms/users/${id}`, AUTH),
    };

    const techLogos = {
        list: () => api.get<ITechLogo[]>("/cms/tech-logos", AUTH),
        get: (id: string) => api.get<ITechLogo>(`/cms/tech-logos/${id}`, AUTH),
        create: (data: Partial<ITechLogo>) => api.post<ITechLogo>("/cms/tech-logos", data, AUTH),
        update: (id: string, data: Partial<ITechLogo>) =>
            api.put<ITechLogo>(`/cms/tech-logos/${id}`, data, AUTH),
        delete: (id: string) => api.delete<void>(`/cms/tech-logos/${id}`, AUTH),
    };

    return { pages, blogPosts, categories, media, authors, affiliates, users, techLogos };
}
