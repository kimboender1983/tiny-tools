export interface ITechLogo {
    _id: string;
    name: string;
    slug: string;
    paths: string[];
    color: string;
    bgColor?: string;
    viewBox?: string;
    fillRule?: "evenodd" | "nonzero";
    source?: "manual" | "simple-icons";
    createdAt: Date;
    updatedAt: Date;
}
