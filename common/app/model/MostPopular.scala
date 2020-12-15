package model

case class MostPopular(heading: String, section: String, trails: Seq[pressed.PressedContent])

/*
  MostPopularNx2 and MostPopularTrail have been introduced to solve a problem:
  making mix tabs with pressed.PressedContent and DeeplyReadItem

  MostPopularTrail will replace both to make the JSON object.
 */

case class MostPopularTrail(
    designType: String,
    pillar: String,
    url: String,
    headline: String,
    isLiveBlog: Boolean,
    linkText: String,
    showByline: Boolean,
    byline: Option[String],
    image: String,
    webPublicationDate: String,
    ageWarning: Option[String],
    mediaType: Option[String],
    avatarUrl: Option[String],
    kickerText: Option[String],
    starRating: Option[Int],
)

case class MostPopularNx2(heading: String, section: String, trails: Seq[MostPopularTrail])
