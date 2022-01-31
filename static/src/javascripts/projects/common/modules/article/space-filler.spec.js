import { spaceFiller } from 'common/modules/article/space-filler';
import {
    findSpace as findSpace_,
    SpaceError,
} from 'common/modules/spacefinder';
import raven from 'lib/raven';
import { noop } from 'lib/noop';

jest.mock('lib/fastdom-promise');
jest.mock('common/modules/spacefinder', () => ({
    findSpace: jest.fn(),
    // eslint-disable-next-line object-shorthand
    SpaceError: function() {
        this.name = 'SpaceError';
    },
}));

jest.mock('lib/raven', () => ({
    captureException: jest.fn(),
}));

const findSpace = (findSpace_);

describe('spacefiller', () => {
    const writeError = new Error('Mock writer exception');

    afterEach(() => {
        raven.captureException.mockReset();
        findSpace.mockReset();
    });

    it('Returns a promise that resolves when the insertion completes', () => {
        const rules = {};
        const els = true;

        findSpace.mockReturnValue(Promise.resolve(els));

        const insertion = spaceFiller.fillSpace(rules, () => {
            return;
        });

        return expect(insertion).resolves.toBe(els);
    });

    it('Passes a ruleset to the spacefinder', () => {
        const rules = {};
        const insertion = spaceFiller.fillSpace(rules, () => {
            return;
        });

        return insertion.then(() => {
            const spaceFinderArgs = findSpace.mock.calls[0];

            expect(spaceFinderArgs[0]).toBe(rules);
        });
    });

    it('If it finds a space, it calls the writer', () => {
        const rules = {};
        const writer = jest.fn();
        const els = [document.createElement('p')];

        findSpace.mockReturnValueOnce(Promise.resolve(els));

        return spaceFiller.fillSpace(rules, writer).then(() => {
            expect(writer).toHaveBeenCalledWith(els);
        });
    });

    it('If there are no spaces, it rejects the promise and does not call the writer', () => {
        const rules = ({
            bodySelector: '',
            slotSelector: '',
            minAbove: 0,
            minBelow: 0,
            clearContentMeta: 0,
            selectors: {},
        });

        findSpace.mockReturnValueOnce(Promise.reject(new SpaceError(rules)));

        const writer = jest.fn();
        const insertion = spaceFiller.fillSpace(rules, writer);

        return insertion.then(result => {
            expect(result).toBe(false);
            expect(writer).not.toHaveBeenCalled();
        });
    });

    it('If there are no spaces, the spacefinder exception is not recorded by Raven', () => {
        // These exceptions are 'expected' and therefore shouldn't go into logging
        const rules = ({
            bodySelector: '',
            slotSelector: '',
            minAbove: 0,
            minBelow: 0,
            clearContentMeta: 0,
            selectors: {},
        });

        findSpace.mockReturnValueOnce(Promise.reject(new SpaceError(rules)));

        const insertion = spaceFiller.fillSpace(rules, noop);

        return insertion.then(() => {
            expect(raven.captureException).not.toHaveBeenCalled();
        });
    });

    it('Calls writers in order', done => {
        // This resolves a longstanding race condition where spacefinder calls would come
        // before the scripts that inject content into spaces had completely ran
        findSpace
            .mockReturnValueOnce(Promise.resolve([document.createElement('p')]))
            .mockReturnValueOnce(
                Promise.resolve([document.createElement('p')])
            );

        const rules = {};
        const firstWriter = jest.fn();

        spaceFiller.fillSpace(rules, firstWriter).catch(done.fail);
        spaceFiller
            .fillSpace(rules, () => {
                expect(firstWriter).toHaveBeenCalled();
                done();
            })
            .catch(done.fail);
    });

    it('If a writer throws an exception, we record it', () => {
        findSpace.mockReturnValueOnce(
            Promise.resolve([document.createElement('p')])
        );

        const rules = {};
        const insertion = spaceFiller.fillSpace(rules, () => {
            throw writeError;
        });

        return insertion.then(() => {
            expect(raven.captureException).toHaveBeenCalledWith(writeError);
        });
    });

    it('If a writer throws an exception, we still call subsequent writers', () => {
        findSpace
            .mockReturnValueOnce(Promise.resolve([document.createElement('p')]))
            .mockReturnValueOnce(
                Promise.resolve([document.createElement('p')])
            );

        const rules = {};
        const writer = jest.fn();
        const brokenWriter = () => {
            throw writeError;
        };

        return spaceFiller.fillSpace(rules, brokenWriter).then(() => {
            spaceFiller.fillSpace(rules, writer).then(() => {
                expect(writer).toHaveBeenCalled();
            });
        });
    });

    it('If a writer throws an exception, the promise is resolved with "false"', () => {
        findSpace.mockReturnValueOnce(
            Promise.resolve([document.createElement('p')])
        );

        const rules = {};
        const insertion = spaceFiller.fillSpace(rules, () => {
            throw writeError;
        });

        return insertion.then(result => {
            expect(result).toBe(false);
        });
    });
});
