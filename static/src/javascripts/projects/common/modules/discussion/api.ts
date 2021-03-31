import config from 'lib/config';

/**
 * This information is partly inspired by the API in discussion-rendering
 * https://github.com/guardian/discussion-rendering/tree/main/src/lib/api.tsx
 */

type Id = number | string;

type Comment = {
	body: string;
	id?: number;
	replyTo?: {
		commentId: string;
	};
};

type CommentResponse = {
	status: 'ok' | 'error';
	statusCode: number;
	message: string;
	errorCode?: string;
};

type AbuseReport = {
	categoryId: number;
	reason?: string;
	email?: string;
};

const defaultInitParams: RequestInit = {
	mode: 'cors',
	credentials: 'include',
	headers: {
		'D2-X-UID': String(config.get('page.discussionD2Uid')),
		'GU-Client': String(config.get('page.discussionApiClientHeader')),
	},
};

export const send = (
	endpoint: string,
	method: string,
	data: string = '',
): Promise<CommentResponse> => {
	if (config.get('switches.enableDiscussionSwitch')) {
		const url = String(config.get('page.discussionApiUrl')) + endpoint;

		// https://github.com/guardian/discussion-rendering/blob/1e8a7c7fa0b6a4273497111f0dab30f479a107bf/src/lib/api.tsx#L140
		if (method === 'POST') {
			const body = new URLSearchParams();
			body.append('body', data);

			return fetch(url, {
				...defaultInitParams,
				method,
				body: body.toString(),
				headers: {
					...defaultInitParams.headers,
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			}).then((resp) => resp.json());
		}

		return fetch(url, {
			...defaultInitParams,
			method,
		}).then((resp) => resp.json());
	}

	throw new Error('Discussion features have been disabled');
};

export const postComment = (
	discussionId: Id,
	comment: Comment,
): Promise<CommentResponse> => {
	const endpoint = `/discussion/${discussionId}/comment${
		comment.replyTo ? `/${comment.replyTo.commentId}/reply` : ''
	}`;

	return send(endpoint, 'POST', comment.body);
};

export const previewComment = (comment: Comment): Promise<CommentResponse> =>
	send('/comment/preview', 'POST', comment.body);

export const recommendComment = (id: Id): Promise<CommentResponse> =>
	send(`/comment/${id}/recommend`, 'POST');

export const pickComment = (id: Id): Promise<CommentResponse> =>
	send(`/comment/${id}/highlight`, 'POST');

export const unPickComment = (id: Id): Promise<CommentResponse> =>
	send(`/comment/${id}/unhighlight`, 'POST');

export const reportComment = (
	id: Id,
	report: AbuseReport,
): Promise<CommentResponse> => {
	const data = new URLSearchParams();
	data.append('categoryId', report.categoryId.toString());
	report.email && data.append('email', report.email.toString());
	report.reason && data.append('reason', report.reason);

	const url =
		String(config.get('page.discussionApiUrl')) +
		`/comment/${id}/reportAbuse`;

	return fetch(url, {
		...defaultInitParams,
		method: 'POST',
		body: data.toString(),
		headers: {
			...defaultInitParams.headers,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	}).then((resp) => resp.json());
};

export const getUser = (id: Id = 'me'): Promise<CommentResponse> =>
	send(`/profile/${id}`, 'GET');
