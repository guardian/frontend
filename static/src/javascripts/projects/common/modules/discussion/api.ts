import config from 'lib/config';

type Id = number | string;

type Comment = {
	body: string;
	id?: number;
	replyTo?: {
		commentId: string;
	};
};

export const send = (
	endpoint: string,
	method: string,
	data = {},
): Promise<Response> => {
	if (config.get('switches.enableDiscussionSwitch')) {
		const url = String(config.get('page.discussionApiUrl')) + endpoint;
		return fetch(url, {
			method,
			mode: 'cors',
			body: JSON.stringify(data),
			headers: {
				'D2-X-UID': String(config.get('page.discussionD2Uid')),
				'GU-Client': String(
					config.get('page.discussionApiClientHeader'),
				),
			},
			credentials: 'include',
		});
	}

	throw new Error('Discussion features have been disabled');
};

export const postComment = (
	discussionId: number | string,
	comment: Comment,
): Promise<Response> => {
	const endpoint = `/discussion/${discussionId}/comment${
		comment.replyTo ? `/${comment.replyTo.commentId}/reply` : ''
	}`;

	return send(endpoint, 'POST', comment);
};

export const previewComment = (comment: Comment): Promise<Response> =>
	send('/comment/preview', 'POST', comment);

export const recommendComment = (id: Id): Promise<Response> =>
	send(`/comment/${id}/recommend`, 'POST');

export const pickComment = (id: Id): Promise<Response> =>
	send(`/comment/${id}/highlight`, 'POST');

export const unPickComment = (id: Id): Promise<Response> =>
	send(`/comment/${id}/unhighlight`, 'POST');

export const reportComment = (
	id: Id,
	report: Record<string, unknown>,
): Promise<Response> => send(`/comment/${id}/reportAbuse`, 'POST', report);

export const getUser = (id: Id = 'me'): Promise<Response> =>
	send(`/profile/${id}`, 'GET');
