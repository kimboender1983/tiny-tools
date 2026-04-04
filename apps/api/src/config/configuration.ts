export default () => ({
    mongoUrl: process.env.MONGO_URL || "mongodb://localhost:27017/tiny-tools",
    jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
    adminEmail: process.env.ADMIN_EMAIL || "admin@tiny-tools.dev",
    adminPassword: process.env.ADMIN_PASSWORD || "admin123",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    port: parseInt(process.env.PORT || "3001", 10),
    r2: {
        accountId: process.env.R2_ACCOUNT_ID || "",
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
        bucketName: process.env.R2_BUCKET_NAME || "tinytools-media",
        publicUrl: process.env.R2_PUBLIC_URL || "",
    },
});
