const partition = <T>(
	array: T[],
	callback: (element: T, i: number, array: T[]) => boolean,
): [T[], T[]] =>
	array.reduce(
		(result: [T[], T[]], e, i) => {
			callback(e, i, array) ? result[0].push(e) : result[1].push(e);
			return result;
		},
		[[], []],
	);

export { partition };
