import type { IFooterSection, INavItem } from "@tiny-tools/shared";

interface NavigationData {
    header: INavItem[];
    footer: IFooterSection[];
}

export function useNavigation() {
    const api = useApi();

    return useAsyncData<NavigationData>(
        "navigation",
        () => api.get<NavigationData>("/content/navigation"),
        {
            default: () => ({ header: [], footer: [] }),
        },
    );
}
