import * as draggable from 'utils/draggable-element';

describe('Draggable element', function () {
    function getSource(media, text, sourceItem) {
        return {
            getData: (type) => {
                if (type === 'application/vnd.mediaservice.crops+json') {
                    return media || '';
                } else if (type === 'Text') {
                    return text || '';
                } else if (type === 'sourceItem') {
                    return sourceItem || '';
                }
            }
        };
    }

    describe('getMediaItem', function () {
        it('ignore empty items', function () {
            var source = getSource();
            expect(draggable.getMediaItem(source)).toBe('');
        });

        it('throws on non JSON data', function () {
            var source = getSource('banana');
            expect(draggable.getMediaItem.bind(draggable, source)).toThrowError(/understood/);
        });

        it('throws when there\'s no crop', function () {
            var source = getSource(JSON.stringify({
                assets: []
            }));
            expect(draggable.getMediaItem.bind(draggable, source)).toThrowError(/suitable crop size/);

            source = getSource(JSON.stringify({
                assets: [{
                    dimensions: {
                        width: 5000
                    }
                }]
            }));
            expect(draggable.getMediaItem.bind(draggable, source)).toThrowError(/suitable crop size/);
        });

        it('returns the largest image', function () {
            var source = getSource(JSON.stringify({
                assets: [{
                    name: 'one',
                    dimensions: {
                        width: 1000
                    }
                }, {
                    name: 'two',
                    dimensions: {
                        width: 500
                    }
                }]
            }));
            expect(draggable.getMediaItem(source).name).toBe('one');
        });
    });

    describe('getItem', function () {
        it('gets a media item if present', function () {
            var source = getSource(JSON.stringify({
                assets: [{
                    name: 'media',
                    dimensions: { width: 800 }
                }]
            }));
            expect(draggable.getItem(source).mediaItem.name).toBe('media');
        });

        it('fails if there\'s no media and no item', function () {
            var source = getSource();
            expect(draggable.getItem.bind(draggable, source)).toThrowError(/add that/);
        });

        it('gets an item from unknown parameters', function () {
            var source = getSource('', 'whatever?url=banana');
            expect(draggable.getItem(source).sourceItem).toEqual({
                id: 'banana'
            });
        });

        it('gets an item from known parameters', function () {
            var source = getSource('', 'whatever?gu-url=banana&gu-color=red&shape=round');
            expect(draggable.getItem(source).sourceItem).toEqual({
                id: 'whatever?shape=round',
                meta: {
                    url: 'banana',
                    color: 'red'
                }
            });
        });

        it('gets an item from the source item', function () {
            var source = getSource('', 'whatever?url=banana', JSON.stringify({
                id: 'internal',
                url: 'banana'
            }));
            expect(draggable.getItem(source).sourceItem).toEqual({
                id: 'internal',
                url: 'banana',
                front: undefined
            });


            expect(draggable.getItem(source, {
                front: 'good-news'
            }).sourceItem).toEqual({
                id: 'internal',
                url: 'banana',
                front: 'good-news'
            });
        });
    });
});
