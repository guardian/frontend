import type { LocalDate } from './dates';

export type StripeCard = {
	last4: string;
	type: string;
	stripePublicKeyForUpdate: string;
};

//the type of the response returned by https://github.com/guardian/members-data-api/blob/b5b7eeb9eff00fbcdf07dce6e95d1eac58d9b5e0/membership-attribute-service/app/models/AccountDetails.scala#L11-L16
export type UserDetails = {
	tier: string;
	isPaidTier: boolean;
	regNumber?: string;
	joinDate: string;
	optIn: boolean;
	subscription: {
		start: string;
		end: string;
		trialLength: number;
		nextPaymentDate: string;
		nextPaymentPrice: number;
		paymentMethod: string;
		renewalDate: string;
		cancelledAt: boolean;
		subscriberId: string;
		plan: {
			name: string;
			amount: number;
			interval: string;
			currency: string;
		};
		payPalEmail?: string;
		account?: {
			accountName: string;
		};
		card?: StripeCard;
	};
	alertText?: string;
};

/**
 * This type is manually kept in sync with the Membership API:
 * https://github.com/guardian/members-data-api/blob/a48acdebed6a334ceb4336ece275b9cf9b3d6bb7/membership-attribute-service/app/models/Attributes.scala#L134-L151
 */
export type UserFeaturesResponse = {
	userId: string;
	tier?: string;
	recurringContributionPaymentPlan?: string;
	oneOffContributionDate?: LocalDate;
	membershipJoinDate?: LocalDate;
	digitalSubscriptionExpiryDate?: LocalDate;
	paperSubscriptionExpiryDate?: LocalDate;
	guardianWeeklyExpiryDate?: LocalDate;
	liveAppSubscriptionExpiryDate?: LocalDate;
	alertAvailableFor?: string;

	showSupportMessaging: boolean;

	contentAccess: {
		member: boolean;
		paidMember: boolean;
		recurringContributor: boolean;
		digitalPack: boolean;
		paperSubscriber: boolean;
		guardianWeeklySubscriber: boolean;
	};
};
