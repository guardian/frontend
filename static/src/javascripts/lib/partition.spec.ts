import { partition } from './partition';

describe('Partition creates two arrays given a predicate function', () => {
	it('partitions and the callback is provided the element, index and array', () => {
		const [left, right] = partition<number>(
			[1, 2, 3, 4, 5],
			(e, i, array) => array[i] === e && e % 2 === 0,
		);
		expect(left).toEqual([2, 4]);
		expect(right).toEqual([1, 3, 5]);
	});
	it('empty partition when not applicable', () => {
		let [left, right] = partition<number>([1, 2, 3, 4, 5], (e) => e < 6);
		expect(left).toEqual([1, 2, 3, 4, 5]);
		expect(right.length).toEqual(0);
		[left, right] = partition<number>([1, 2, 3, 4, 5], (e) => e > 5);
		expect(left.length).toEqual(0);
		expect(right).toEqual([1, 2, 3, 4, 5]);
	});
});
