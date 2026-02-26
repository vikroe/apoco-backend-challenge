export const getEnvValue = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} env variable is required.`);
    }

    return value;
};