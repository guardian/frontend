define(['models/edition', 'models/trailblock', 'knockout', 'Common'], function (Edition, Trailblock, Knockout, Common) {

	return function(data) {

        var self = this;

        this.editions = Knockout.observableArray();

        this._endpoint = '/admin/feature-trailblock';

        this.toJSON = function() {
            var data = {};
            self.editions().forEach(function(edition){

                var blocks = [];
                edition.trailblocks().forEach(function(trailblock) {
                    // only include blocks with an id
                    if (trailblock.id()) {
                        blocks.push(Knockout.toJS(trailblock));
                    }
                });

                data[edition.id] = {
                    'blocks': blocks
                }
            });

            return JSON.stringify(data);
        }

        this.clear = function() {
            self.editions().forEach(function(edition) {
                edition.trailblocks().forEach(function(trailblock) {
                    trailblock.clear();
                });
            });
        }

        this.save =  function() {
            $.ajax({
                contentType: 'application/json',
                type: 'POST',
                url: self._endpoint,
                dataType: 'json',
                data: self.toJSON(),
                success: function() {
                    Common.mediator.emitEvent('models:networkfront:save:success', [self]);
                },
                error: function() {
                    Common.mediator.emitEvent('models:networkfront:save:error', [self]);
                },
                complete: function() {
                    Common.mediator.emitEvent('models:networkfront:save:complete', [self]);
                }
            });


        }

        // create editions, and associated trailblocks
        $.each(['uk', 'us'], function(index, editionId) {
            var edition = new Edition;
            edition.id = editionId;

            if (data) {
                var editionConfig = data[editionId];
                if (editionConfig && editionConfig.blocks) {
                    editionConfig.blocks.forEach(function (block) {
                        var trailblock = new Trailblock;
                        trailblock.update(block);
                        edition.trailblocks.push(trailblock);

                    });
                }
            }

            // need at least one trailblock
            if (edition.trailblocks().length === 0) {
                edition.trailblocks.push(new Trailblock);
            }

            self.editions.push(edition);
        });

        Common.mediator.addListener('ui:networkfronttool:clear', this.clear);
        Common.mediator.addListener('ui:networkfronttool:save', this.save);

	};

});
