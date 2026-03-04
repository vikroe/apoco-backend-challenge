export const getEnvValue = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} env variable is required.`);
    }

    return value;
};

export const getOptionalEnvValue = (name: string): string | undefined => {
    const value = process.env[name]?.trim();
    return value ? value : undefined;
};

export const getPositiveIntegerEnvValue = (name: string): number => {
    const rawValue = getEnvValue(name);
    const parsedValue = Number.parseInt(rawValue, 10);
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
        throw new Error(`${name} env variable must be a positive integer.`);
    }

    return parsedValue;
};
