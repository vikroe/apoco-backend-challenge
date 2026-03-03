export const normalizePokemonId = (id: string) => {
    return id.trim().replace(/^0+/, '') || '0';
};
