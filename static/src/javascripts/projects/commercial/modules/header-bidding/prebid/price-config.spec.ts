import {
	criteoPriceGranularity,
	ozonePriceGranularity,
	priceGranularity,
} from './price-config';

describe('priceGranularity', () => {
	test('default should have correct buckets', () => {
		expect(priceGranularity).toEqual({
			buckets: [
				{
					max: 100,
					increment: 0.01,
				},
				{
					max: 500,
					increment: 1,
				},
			],
		});
	});

	test('criteo should have correct buckets', () => {
		expect(criteoPriceGranularity).toEqual({
			buckets: [
				{
					max: 12,
					increment: 0.01,
				},
				{
					max: 20,
					increment: 0.05,
				},
				{
					max: 500,
					increment: 1,
				},
			],
		});
	});

	const granularityOption1 = {
		buckets: [
			{
				max: 10,
				increment: 0.01,
			},
			{
				max: 15,
				increment: 0.1,
			},
			{
				max: 50,
				increment: 1,
			},
		],
	};

	const granularityOption2 = {
		buckets: [
			{
				max: 12,
				increment: 0.01,
			},
			{
				max: 20,
				increment: 0.1,
			},
			{
				max: 50,
				increment: 1,
			},
		],
	};

	test.each([
		[[100, 100], undefined],
		[[160, 600], granularityOption1],
		[[300, 600], granularityOption1],
		[[728, 90], granularityOption2],
		[[970, 250], granularityOption2],
		[[300, 250], granularityOption2],
	])(
		'Ozone slot with size %d,%d gives correct granularity',
		([width, height], expectedGranularity) => {
			expect(ozonePriceGranularity(width, height)).toEqual(
				expectedGranularity,
			);
		},
	);
});
