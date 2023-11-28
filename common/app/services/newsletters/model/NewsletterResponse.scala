package services.newsletters.model

import play.api.libs.json.Json
import services.NewsletterData

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

case class NewsletterResponseV2(
    identityName: String,
    listId: Int,
    name: String,
    theme: String, // ["news", "opinion", "culture", "sport", "lifestyle", "features"]
    group: String,
    status: String, // 'paused', 'cancelled', 'live', 'pending'
    restricted: Boolean,
    signUpEmbedDescription: String,
    signUpDescription: String,
    frequency: String,
    mailSuccessDescription: Option[String],
    regionFocus: Option[String], // edition Id
    illustrationCard: Option[String],
    illustrationCircle: Option[String],
    seriesTag: Option[String],
    signupPage: Option[String],
    exampleUrl: Option[String],
    category: String, // "article-based", "article-based-legacy", "fronts-based", "manual-send", "other"]
    emailConfirmation: Boolean,
) {
  def toNewsletterData: NewsletterData = {
    NewsletterData(
      identityName,
      name,
      theme,
      signUpDescription,
      frequency,
      listId,
      group,
      mailSuccessDescription.getOrElse("You are subscribed"),
      regionFocus,
      illustrationCard,
    )
  }
}

object NewsletterResponseV2 {
  implicit val newsletterResponseV2Reads = Json.reads[NewsletterResponseV2]
  implicit val newsletterResponseV2Writes = Json.writes[NewsletterResponseV2]
}

case class NewslettersGetResponseV2Body(
    ok: Boolean,
    total: Int,
    data: List[NewsletterResponseV2],
)

object NewslettersGetResponseV2Body {
  implicit val newslettersGetResponseV2BodyReads = Json.reads[NewslettersGetResponseV2Body]
  implicit val newslettersGetResponseV2BodyWrites = Json.writes[NewslettersGetResponseV2Body]
}
