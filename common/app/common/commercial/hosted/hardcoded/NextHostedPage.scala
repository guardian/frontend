package common.commercial.hosted.hardcoded

case class NextHostedPage(
  id: String,
  title: String,
  contentType: HostedContentType.Value,
  imageUrl: String
) {

  val url = s"/$id"
}
