package controllers

import model.IdentityPage
import utils.ConsentsJourneyType._

package object editprofile {
  object PublicEditProfilePage extends IdentityPage("/public/edit", "Edit Public Profile")
  object AccountEditProfilePage extends IdentityPage("/account/edit", "Edit Account Details")
  object EmailPrefsProfilePage extends IdentityPage("/email-prefs", "Emails")
  object MembershipEditProfilePage extends IdentityPage("/membership/edit", "Membership")
  object recurringContributionPage extends IdentityPage("/contribution/recurring/edit", "Contributions")
  object DigiPackEditProfilePage extends IdentityPage("/digitalpack/edit", "Digital Pack")

  sealed abstract class ConsentJourneyPage(id: String, val journey: AnyConsentsJourney)
      extends IdentityPage(id, "Consent", isFlow = true)

  object ConsentJourneyPageNewsletters extends ConsentJourneyPage("/consents/newsletters", NewsletterConsentsJourney)
  object ConsentJourneyPageThankYou extends ConsentJourneyPage("/consents/thank-you", ThankYouConsentsJourney)
  object ConsentJourneyPageGdprCampaign extends ConsentJourneyPage("/consents/staywithus", GdprCampaignConsentsJourney)
  object ConsentJourneyPageDefault extends ConsentJourneyPage("/consents", DefaultConsentsJourney)
}
