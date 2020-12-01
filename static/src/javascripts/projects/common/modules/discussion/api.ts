import { ajax } from 'lib/ajax';
import config from 'lib/config';

export const send = (
    endpoint: string,
    method: 'post' | 'get',
    data: Object = {}
): any => {
    if (config.get('switches.enableDiscussionSwitch')) {
        return ajax({
            url: config.get('page.discussionApiUrl') + endpoint,
            type: method === 'get' ? 'jsonp' : 'json',
            method,
            crossOrigin: true,
            data,
            headers: {
                'D2-X-UID': config.get('page.discussionD2Uid'),
                'GU-Client': config.get('page.discussionApiClientHeader'),
            },
            withCredentials: true,
        });
    }

    throw new Error('Discussion features have been disabled');
};

export const postComment = (discussionId: number | string, comment: Object) => {
    const endpoint = `/discussion/${discussionId}/comment${
        comment.replyTo ? `/${comment.replyTo.commentId}/reply` : ''
    }`;

    return send(endpoint, 'post', comment);
};

export const previewComment = (comment: Object) =>
    send('/comment/preview', 'post', comment);

export const recommendComment = (id: number | string) =>
    send(`/comment/${id}/recommend`, 'post');

export const pickComment = (id: number | string) =>
    send(`/comment/${id}/highlight`, 'post');

export const unPickComment = (id: number | string) =>
    send(`/comment/${id}/unhighlight`, 'post');

export const reportComment = (id: number | string, report: Object) =>
    send(`/comment/${id}/reportAbuse`, 'post', report);

export const getUser = (id: number | string = 'me') =>
    send(`/profile/${id}`, 'get');
