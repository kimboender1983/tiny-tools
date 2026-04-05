export interface IApiKey {
    _id: string;
    name: string;
    key: string;
    permissions: string[];
    active: boolean;
    lastUsedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
