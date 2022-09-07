package services.newsletters.model

import play.api.libs.json.Json

case class NewsletterResponse(
    identityName: String,
    name: String,
    brazeNewsletterName: String,
    brazeSubscribeAttributeName: String,
    brazeSubscribeEventNamePrefix: String,
    theme: String,
    description: String,
    frequency: String,
    listIdV1: Int,
    listId: Int,
    exampleUrl: Option[String],
    emailEmbed: EmailEmbed,
    illustration: Option[NewsletterIllustration] = None,
    signupPage: Option[String],
    restricted: Boolean,
    paused: Boolean,
    cancelled: Boolean,
    emailConfirmation: Boolean,
    group: String,
    regionFocus: Option[String],
)

object NewsletterResponse {
  implicit val emailEmbedReads = Json.reads[EmailEmbed]
  implicit val emailEmbedWrites = Json.writes[EmailEmbed]
  implicit val newsletterIllustrationReads = Json.reads[NewsletterIllustration]
  implicit val newsletterIllustrationWrites = Json.writes[NewsletterIllustration]
  implicit val newsletterResponseReads = Json.reads[NewsletterResponse]
  implicit val newsletterResponseWrites = Json.writes[NewsletterResponse]
}
