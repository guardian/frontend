package services.newsletters.model

import play.api.libs.json.{Json, OWrites, Reads}

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
  implicit val emailEmbedReads: Reads[EmailEmbed] = Json.reads[EmailEmbed]
  implicit val emailEmbedWrites: OWrites[EmailEmbed] = Json.writes[EmailEmbed]
  implicit val newsletterIllustrationReads: Reads[NewsletterIllustration] = Json.reads[NewsletterIllustration]
  implicit val newsletterIllustrationWrites: OWrites[NewsletterIllustration] = Json.writes[NewsletterIllustration]
  implicit val newsletterResponseReads: Reads[NewsletterResponse] = Json.reads[NewsletterResponse]
  implicit val newsletterResponseWrites: OWrites[NewsletterResponse] = Json.writes[NewsletterResponse]
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
)

object NewsletterResponseV2 {
  implicit val newsletterResponseV2Reads: Reads[NewsletterResponseV2] = Json.reads[NewsletterResponseV2]
  implicit val newsletterResponseV2Writes: OWrites[NewsletterResponseV2] = Json.writes[NewsletterResponseV2]
}

case class NewslettersGetResponseV2Body(
    ok: Boolean,
    total: Int,
    data: List[NewsletterResponseV2],
)

object NewslettersGetResponseV2Body {
  implicit val newslettersGetResponseV2BodyReads: Reads[NewslettersGetResponseV2Body] =
    Json.reads[NewslettersGetResponseV2Body]
  implicit val newslettersGetResponseV2BodyWrites: OWrites[NewslettersGetResponseV2Body] =
    Json.writes[NewslettersGetResponseV2Body]
}

case class NewsletterLayoutGroup(
    title: String,
    subtitle: Option[String],
    newsletters: List[String],
)

object NewsletterLayoutGroup {
  implicit val newsletterLayoutGroupReads: Reads[NewsletterLayoutGroup] =
    Json.reads[NewsletterLayoutGroup]
  implicit val newsletterLayoutGroupWrites: OWrites[NewsletterLayoutGroup] =
    Json.writes[NewsletterLayoutGroup]
}

case class NewsletterLayout(
  groups: List[NewsletterLayoutGroup]
)

object NewsletterLayout {
    implicit val newsletterLayoutReads: Reads[NewsletterLayout] =
    Json.reads[NewsletterLayout]
  implicit val newsletterLayoutWrites: OWrites[NewsletterLayout] =
    Json.writes[NewsletterLayout]
}

case class NewsletterLayoutsResponseBody(
    ok: Boolean,
    total: Int,
    data: Map[String, NewsletterLayout],
)

object NewsletterLayoutsResponseBody {
  implicit val newsletterLayoutsResponseBodyReads: Reads[NewsletterLayoutsResponseBody] =
    Json.reads[NewsletterLayoutsResponseBody]
  implicit val newsletterLayoutsResponseBodyWrites: OWrites[NewsletterLayoutsResponseBody] =
    Json.writes[NewsletterLayoutsResponseBody]
}
