import config from 'lib/config';
import { getAuthStatus, getOptionsHeadersWithOkta } from '../identity/api';

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

type UserResponse = {
	status: 'ok' | 'error';
	userProfile: {
		userId: string;
		displayName: string;
		webUrl: string;
		apiUrl: string;
		avatar: string;
		secureAvatarUrl: string;
		isStaff: boolean;
		privateFields: {
			canPostComment: boolean;
			isPremoderated: boolean;
			hasCommented: boolean;
		};
	};
};

type Response = UserResponse | CommentResponse;

type AbuseReport = {
	categoryId: number;
	reason?: string;
	email?: string;
};

const defaultInitParams: RequestInit = {
	mode: 'cors',
	headers: {
		'D2-X-UID': config.get<string>('page.discussionD2Uid', 'NONE_FOUND'),
		'GU-Client': config.get<string>(
			'page.discussionApiClientHeader',
			'NONE_FOUND',
		),
	},
};

export const send = <T extends Response = CommentResponse>(
	endpoint: string,
	method: 'GET' | 'POST',
	data?: Comment | AbuseReport,
): Promise<T> =>
	Promise.resolve(config.get('switches.enableDiscussionSwitch'))
		.then((isDiscussionEnabled) =>
			isDiscussionEnabled
				? Promise.resolve()
				: Promise.reject('switches.enableDiscussionSwitch is off'),
		)
		.then(() => getAuthStatus())
		.then((authStatus) =>
			authStatus.kind === 'SignedInWithCookies' ||
			authStatus.kind === 'SignedInWithOkta'
				? authStatus
				: Promise.reject('User is signed out'),
		)
		.then((signedInAuthStatus) => {
			const apiUrl = config.get<string>(
				'page.discussionApiUrl',
				'/DISCUSSION_API_URL_NOT_FOUND',
			);
			const url = apiUrl + endpoint;

			const requestAuthOptions =
				getOptionsHeadersWithOkta(signedInAuthStatus);

			// https://github.com/guardian/discussion-rendering/blob/1e8a7c7fa0b6a4273497111f0dab30f479a107bf/src/lib/api.tsx#L140
			if (method === 'POST') {
				const body = new URLSearchParams();

				if (data) {
					if ('body' in data) {
						body.append('body', data.body);
					}
					if ('categoryId' in data) {
						body.append('categoryId', data.categoryId.toString());
						data.email &&
							body.append('email', data.email.toString());
						data.reason && body.append('reason', data.reason);
					}
				}

				return fetch(url, {
					...defaultInitParams,
					method,
					body: body.toString(),
					credentials: requestAuthOptions.credentials,
					headers: {
						...defaultInitParams.headers,
						...requestAuthOptions.headers,
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				}).then((resp) => resp.json() as Promise<T>);
			}

			return fetch(url, {
				...defaultInitParams,
				...requestAuthOptions,
				method,
			}).then((resp) => resp.json() as Promise<T>);
		});

export const postComment = (
	discussionId: Id,
	comment: Comment,
): Promise<CommentResponse> => {
	const endpoint = `/discussion/${discussionId}/comment${
		comment.replyTo ? `/${comment.replyTo.commentId}/reply` : ''
	}`;

	return send(endpoint, 'POST', comment);
};

export const previewComment = (comment: Comment): Promise<CommentResponse> =>
	send('/comment/preview', 'POST', comment);

export const recommendComment = (id: Id): Promise<CommentResponse> =>
	send(`/comment/${id}/recommend`, 'POST');

export const pickComment = (id: Id): Promise<CommentResponse> =>
	send(`/comment/${id}/highlight`, 'POST');

export const unPickComment = (id: Id): Promise<CommentResponse> =>
	send(`/comment/${id}/unhighlight`, 'POST');

export const reportComment = (
	id: Id,
	report: AbuseReport,
): Promise<CommentResponse> =>
	send(`/comment/${id}/reportAbuse`, 'POST', report);

/** @type {(): Promise<UserResponse>} */
export const getUser = (): Promise<UserResponse> =>
	send(`/profile/me?strict_sanctions_check=false`, 'GET');
