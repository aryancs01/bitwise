import dotenv from "dotenv"

dotenv.config()

export const env = {
    PORT: process.env.PORT || 5001,
    MONGO_URI: process.env.MONGO_URI as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    REDIS_HOST: process.env.REDIS_HOST as string,
    REDIS_PORT: parseInt(process.env.REDIS_PORT as string, 10) || 6379,
}