const cache = new Map();

const observe = (
    element,
    threshold,
    callback
) => {
    let record = cache.get(threshold);
    if (!record) {
        record = {
            registry: [{ callback, element }],
            observer: new window.IntersectionObserver(
                (entries) => {
                    const record2 = cache.get(threshold);
                    if (!record2) return;

                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const buddy = record2.registry.find(
                                ({ element: e }) => e === entry.target
                            );
                            if (buddy) {
                                buddy.callback(entry.intersectionRatio);
                            }
                        }
                    });
                },
                { threshold }
            ),
        };
    } else {
        record.registry.push({ callback, element });
    }
    cache.set(threshold, record);
    record.observer.observe(element);
};

const unobserve = (
    element,
    threshold,
    callback
) => {
    const record = cache.get(threshold);
    if (!record) return;

    const buddyIdx = record.registry.findIndex(
        ({ element: e, callback: c }) => e === element && c === callback
    );
    if (buddyIdx === -1) return;

    record.registry.splice(buddyIdx, 1);

    if (record.registry.length === 0) {
        cache.delete(threshold);
    } else {
        cache.set(threshold, record);
    }
};

const viewport = {
    observe,
    unobserve,
};

export { viewport };
