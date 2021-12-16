const dates = {
	1: '01',
	2: '02',
	3: '03',
	4: '04',
	5: '05',
	6: '06',
	7: '07',
	8: '08',
	9: '09',
	10: '10',
	11: '11',
	12: '12',
	13: '13',
	14: '14',
	15: '15',
	16: '16',
	17: '17',
	18: '18',
	19: '19',
	20: '20',
	21: '21',
	22: '22',
	23: '23',
	24: '24',
	25: '25',
	26: '26',
	27: '27',
	28: '28',
	29: '29',
	30: '30',
	31: '31',
} as const;
const months = {
	1: '01',
	2: '02',
	3: '03',
	4: '04',
	5: '05',
	6: '06',
	7: '07',
	8: '08',
	9: '09',
	10: '10',
	11: '11',
	12: '12',
} as const;
type LocalDate =
	`${number}-${typeof months[keyof typeof months]}-${typeof dates[keyof typeof dates]}`;

const getLocalDate = (year: number, month: number, date: number): LocalDate => {
	return `${year}-${months[month as keyof typeof months]}-${
		dates[date as keyof typeof dates]
	}`;
};

export type { LocalDate };
export { getLocalDate };
