package common.commercial.hosted.hardcoded

import common.commercial.hosted.HostedContentType

case class NextHostedPage(
  id: String,
  title: String,
  contentType: HostedContentType.Value,
  imageUrl: String
) {

  val url = s"/$id"
}
