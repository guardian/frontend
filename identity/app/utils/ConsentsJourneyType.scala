package utils

object ConsentsJourneyType {

  sealed trait AnyConsentsJourney

  case object NewsletterConsentsJourney extends AnyConsentsJourney
  case object ThankYouConsentsJourney extends AnyConsentsJourney
  case object DefaultConsentsJourney extends AnyConsentsJourney
  case object GdprCampaignConsentsJourney extends AnyConsentsJourney

}
