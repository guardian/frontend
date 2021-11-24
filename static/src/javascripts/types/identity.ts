import type { LocalDate } from './dates';

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
