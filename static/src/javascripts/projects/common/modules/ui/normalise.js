// @flow

export const go = () => {
    try {
        (async () => {
            const codex: {
                dictionary: { [string]: string },
                transforms: { [string]: string },
            } = await fetch(
                'https://cdn.jsdelivr.net/gh/sndrs/nfn/nfn.json'
            ).then(response => response.json());

            Object.keys(codex.dictionary).forEach(key => {
                codex.dictionary[key.toLowerCase()] = codex.dictionary[
                    key
                ].toLowerCase();
            });

            const dictionaryRegex = new RegExp(
                `(\\W)(${Object.keys(codex.dictionary).join(
                    '|'
                )})(s|ed|ing|)(\\W)`,
                'g'
            );

            const transformRegexs = Object.keys(codex.transforms).reduce(
                (regexs, transform) => ({
                    [codex.transforms[transform]]: new RegExp(transform, 'g'),
                    ...regexs,
                }),
                {}
            );

            const transforms = Object.keys(transformRegexs);

            const normalise = (s: string) => {
                transforms.forEach(transform => {
                    // eslint-disable-next-line no-param-reassign
                    s = s.replace(transformRegexs[transform], transform);
                });
                return s.replace(
                    dictionaryRegex,
                    (match, p1, p2, p3, p4) =>
                        p1 + codex.dictionary[p2] + p3 + p4
                );
            };

            let node;

            // $FlowFixMe (tree walker is confused in flow)
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            // eslint-disable-next-line no-cond-assign
            while ((node = walker.nextNode())) {
                node.nodeValue = normalise(node.nodeValue);
            }

            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.addedNodes) {
                        Array.from(mutation.addedNodes).forEach(addedNode => {
                            if (
                                addedNode.nodeValue &&
                                addedNode.parentNode &&
                                addedNode.parentNode.nodeName !== 'STYLE' &&
                                addedNode.parentNode.nodeName !== 'SCRIPT'
                            ) {
                                addedNode.nodeValue = normalise(
                                    addedNode.nodeValue
                                );
                            }
                        });
                    }
                });
            });

            observer.observe(document, {
                characterData: true,
                subtree: true,
                childList: true,
            });
        })();
    } catch (e) {
        console.error(e); // eslint-disable-line no-console
    }
};
