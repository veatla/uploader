export const ENV = {
    PORT: process.env.PORT || 4000,
    API_BASE_URL: process.env.API_BASE_URL || `http://localhost:${ENV.PORT}`,
};
