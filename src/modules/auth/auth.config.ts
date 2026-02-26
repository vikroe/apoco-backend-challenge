import { getEnvValue } from "../../utils/env";

export const JWT_SECRET = getEnvValue("JWT_SECRET");
export const ACCESS_TOKEN_TTL_SECONDS = parseInt(getEnvValue("JWT_ACCESS_TTL_SECONDS"));
