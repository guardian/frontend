import Promise from 'Promise';
import _ from 'underscore';
import authedAjax from 'modules/authed-ajax';

export default function(type, groups) {
    return new Promise(function (resolve, reject) {
        var stories = [];
        _.each(groups, function (group) {
            _.each(group.items(), function (story) {
                stories.push({
                    group: story.group.index,
                    isBoosted: !!story.meta.isBoosted()
                });
            });
        });

        if (!stories.length) {
            reject(new Error('Empty collection'));
        } else {
            authedAjax.request({
                url: '/stories-visible/' + type,
                method: 'POST',
                data: JSON.stringify({
                    stories: stories
                }),
                dataType: 'json'
            })
            .done(function (result) {
                resolve(result);
            })
            .fail(function (error) {
                reject(new Error(error.statusText));
            });
        }
    });
}
