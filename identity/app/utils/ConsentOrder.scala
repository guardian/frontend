package utils

import com.gu.identity.model.{Consent, User}

/** Utility for changing the order of consents */
object ConsentOrder {

  /** This list controls the order. */
  private val orderedConsentIds: List[String] =
    List(
      "supporter",
      "jobs",
      "holidays",
      "events",
      "offers",
      "post_optout",
      "phone_optout",
      "sms",
      "market_research_optout",
      "profiling_optout",
    )

  /**
    * Ordered + optionally hintend consents
    *
    * @param userDO user object from identity-model which has consents field
    * @param consentHint optional hint which would move that particular consent to the front
    * @return copy of user with reordered consents
    */
  def userWithOrderedConsents(userDO: User, consentHint: Option[String]): User = {
    val consentsToReorder =
      if (userDO.consents.isEmpty)
        Consent.defaultConsents
      else
        // handle any default consents that may have been added since this user was created.
        Consent.addNewDefaults(userDO.consents)

    userDO.copy(consents = hintedConsents(orderedConsents(consentsToReorder), consentHint))
  }

  /** If consentHint is provided it moves that consent to the head of consents list */
  private def hintedConsents(consents: List[Consent], consentHint: Option[String]): List[Consent] = {

    // https://stackoverflow.com/questions/24870729/moving-an-element-to-the-front-of-a-list-in-scala
    def moveToFront(hint: String, consents: List[Consent]): List[Consent] = {
      consents.span(consent => consent.id != hint) match {
        case (as, h :: bs) => h :: as ++ bs
        case _             => consents
      }
    }

    consentHint.map(hint => moveToFront(hint, consents)).getOrElse(consents)
  }

  private def orderedConsents(consents: List[Consent]): List[Consent] =
    orderedConsentIds.map(id => consents.find(_.id == id)).flatten

}
