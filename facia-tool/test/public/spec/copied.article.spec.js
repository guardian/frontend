import copied from 'modules/copied-article';

describe('Copied articles', function () {
    function Article (opts) {
        this.group = opts.group;
        this.front = opts.front;
        this.meta = {
            snapType: function () {
                return opts.snapType;
            },
            customKicker: function () {
                return opts.customKicker;
            },
            headline: function () {
                return opts.headline;
            }
        };
        if (opts.fieldHeadline) {
            this.fields = {
                headline: function () {
                    return opts.fieldHeadline;
                }
            };
        }
    }

    it('stores the last copied article', function () {
        var one = new Article({
            headline: 'banana',
            group: {
                front: 1
            }
        }),
        two = new Article({
            headline: 'apple',
            group: 12
        }),
        got,
        spy = jasmine.createSpy('spy');
        copied.on('change', spy);

        copied.set(one);
        got = copied.get();
        expect(got.article).toBe(one);
        expect(got.displayName).toBe('banana');
        expect(got.front).toBe(1);
        expect(spy).toHaveBeenCalledWith(true);
        spy.calls.reset();

        copied.set(two);
        // No matter how many times you get
        got = copied.get();
        got = copied.get();
        got = copied.get();
        expect(got.article).toBe(two);
        expect(got.displayName).toBe('apple');
        expect(got.group).toBe(12);
        expect(spy).toHaveBeenCalledWith(true);
        spy.calls.reset();

        copied.flush();
        got = copied.get();
        expect(got).toBeUndefined();
        expect(spy).toHaveBeenCalledWith(false);
        copied.off(spy);
    });

    it('handles snap links', function () {
        var article = new Article({
            headline: 'kiwi',
            snapType: 'latest',
            customKicker: 'green fruit',
            group: {
                front: 14
            }
        });

        copied.set(article);
        var got = copied.get();
        expect(got.article).toBe(article);
        expect(got.displayName).toBe('{ green fruit }');
        expect(got.front).toBe(14);
    });

    it('handles field headline', function () {
        var article = new Article({
            fieldHeadline: 'what?',
            group: {
                front: 14
            }
        });

        copied.set(article);
        var got = copied.get();
        expect(got.article).toBe(article);
        expect(got.displayName).toBe('what?');
        expect(got.front).toBe(14);
    });

    it('detaches from source', function () {
        var article = new Article({
            headline: 'banana',
            group: {
                front: true
            }
        });

        copied.set(article);
        // When you get the first time it's the same
        var got = copied.get(true);
        expect(got.article).toBe(article);
        expect(got.displayName).toBe('banana');
        expect(got.front).toBe(true);
        expect(got.group).toEqual({
            front: true
        });

        // Second time it's detached
        got = copied.get(true);
        expect(got.article).toBe(article);
        expect(got.displayName).toBe('banana');
        expect(got.front).toBeUndefined();
        expect(got.group).toBeUndefined();
    });
});
