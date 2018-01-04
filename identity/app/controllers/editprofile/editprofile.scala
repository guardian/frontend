package controllers

import model.IdentityPage

package object editprofile {
  object PublicEditProfilePage extends IdentityPage("/public/edit", "Edit Public Profile")
  object AccountEditProfilePage extends IdentityPage("/account/edit", "Edit Account Details")
  object EmailPrefsProfilePage extends IdentityPage("/email-prefs", "Emails")
  object MembershipEditProfilePage extends IdentityPage("/membership/edit", "Membership")
  object recurringContributionPage extends IdentityPage("/contribution/recurring/edit", "Contributions")
  object DigiPackEditProfilePage extends IdentityPage("/digitalpack/edit", "Digital Pack")

  sealed abstract class ConsentJourneyPage(id: String, val journey: String)
      extends IdentityPage(id, "Consent", isFlow = true)

  object ConsentJourneyPageAll extends ConsentJourneyPage("/consents/all", "all")
  object ConsentJourneyPageNewsletters extends ConsentJourneyPage("/consents/newsletters", "newsletters")
  object ConsentJourneyPageDefault extends ConsentJourneyPage("/consents", "default")
}
