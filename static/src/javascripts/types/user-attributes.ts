// the type of the response returned by https://members-data-api.theguardian.com/user-attributes/me/mma-monthlycontribution
declare type ContributorDetails = {
    tier: string;
    isPaidTier: boolean;
    joinDate: string;
    optIn: boolean;
    subscription: {
        paymentMethod: string;
        payPalEmail?: string;
        card?: StripeCard;
        start: string;
        end: string;
        nextPaymentPrice: number;
        nextPaymentDate: string;
        renewalDate: string;
        cancelledAt: boolean;
        subscriberId: string;
        trialLength: number;
        plan: {
            name: string;
            amount: number;
            currency: string;
            interval: string;
        };
    };
    alertText?: string;
};
