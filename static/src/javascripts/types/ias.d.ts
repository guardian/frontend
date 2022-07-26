type IasSlotTargeting = Record<string, string[]>;

export interface IasTargeting {
	brandSafety: Record<string, string>;
	custom?: {
		'ias-kw'?: string[];
	};
	fr?: 'true' | 'false';
	slots: Record<string, IasSlotTargeting>;
}

export interface IasPETSlot {
	adSlotId: string;
	size: Array<[number, number]>;
	adUnitPath: string;
}
