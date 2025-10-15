package controllers

import model.IdentityPage
import utils.ConsentsJourneyType._

package object editprofile {
  object PublicEditProfilePage extends IdentityPage("/public/edit", "Edit Public Profile")
  object AccountEditProfilePage extends IdentityPage("/account/edit", "Edit Account Details")
  object EmailPrefsProfilePage extends IdentityPage("/email-prefs", "Emails")

  sealed abstract class ConsentJourneyPage(id: String, val journey: AnyConsentsJourney)
      extends IdentityPage(id, "Consent", isFlow = true)

  object ConsentJourneyPageThankYou extends ConsentJourneyPage("/consents/thank-you", ThankYouConsentsJourney)
  object ConsentJourneyPageDefault extends ConsentJourneyPage("/consents", DefaultConsentsJourney)
}
