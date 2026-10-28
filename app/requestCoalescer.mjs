// Only concurrent requests are shared. No settled prices, slots or personal data are cached.
export function createRequestCoalescer() {
    let scope;
    let requests = new Map();
    return (nextScope, key, load) => {
        if (nextScope !== scope) {
            scope = nextScope;
            requests = new Map();
        }
        if (requests.has(key)) return requests.get(key);
        const generation = requests;
        const promise = Promise.resolve().then(load).finally(() => {
            if (generation.get(key) === promise) generation.delete(key);
        });
        generation.set(key, promise);
        return promise;
    };
}
