package model

object EndSlateComponents {
  def fromContent(content: Content) = EndSlateComponents(
    content.series collectFirst { case Tag(apiTag, _) => apiTag.id },
    content.section,
    content.shortUrl
  )
}

case class EndSlateComponents(
  seriesId: Option[String],
  sectionId: String,
  shortUrl: String
) {
  def toUriPath = {
    val url = seriesId.fold(s"/video/end-slate/section/$sectionId")(id => s"/video/end-slate/series/$id")
    s"$url.json?shortUrl=$shortUrl"
  }
}
