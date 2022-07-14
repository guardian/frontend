/**
 * Pads a number with the required number of leading
 * zeros to be of a required length in string form
 * @param {number} value a non-negative integer value less than 10**requiredLength
 * @param {number} requiredLength
 * @returns a string of the required length representing the number
 */
const toNDigits = (value: number, requiredLength: number): string => {
	const valueString = value.toString();

	if (valueString.length < requiredLength) {
		return `${'0'.repeat(
			requiredLength - valueString.length,
		)}${valueString}`;
	}
	return valueString;
};

const to2Digits = (v: number): string => toNDigits(v, 2);

/**
 * Converts a Date to a string in the format used by the data team
 * IE yyy-MM-dd hh:mm:ss.ssssss UTC
 *
 * There **should** be a better way to do this.
 */
export const formatTimestampToUTC = (inputDate: Date): string => {
	const utc = {
		year: inputDate.getUTCFullYear(),
		month: inputDate.getUTCMonth() + 1,
		date: inputDate.getUTCDate(),
		hours: inputDate.getUTCHours(),
		minutes: inputDate.getUTCMinutes(),
		seconds: inputDate.getUTCSeconds(),
		milliseconds: inputDate.getUTCMilliseconds(),
	};

	const date = `${utc.year}-${to2Digits(utc.month)}-${to2Digits(utc.date)}`;
	const time = `${to2Digits(utc.hours)}:${to2Digits(utc.minutes)}:${to2Digits(
		utc.seconds,
	)}`;
	const microSeconds = toNDigits(utc.milliseconds * 1000, 6);

	return `${date} ${time}.${microSeconds} UTC`;
};
