export function createRequestCoalescer(): <T>(scope: string, key: string, load: () => Promise<T>) => Promise<T>;
