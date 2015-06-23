import Promise from 'Promise';
import _ from 'underscore';
import {request} from 'modules/authed-ajax';

export default function(type, groups) {
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
        return Promise.reject(new Error('Empty collection'));
    } else {
        return request({
            url: '/stories-visible/' + type,
            method: 'POST',
            data: JSON.stringify({
                stories: stories
            }),
            dataType: 'json'
        })
        .catch(function (error) {
            throw new Error(error.statusText);
        });
    }
}
