package model.hosted

import com.gu.contentapi.client.model.v1.Content
import common.GuLogging

case class HostedOnwardTrails(
    url: String,
    headline: String,
    image: ,

                             )

object HostedOnwardTrails extends GuLogging {

  private def publishedDateTime(item: Content): Long = item.webPublicationDate.map(_.dateTime).getOrElse(0L)

  def fromContent(itemId: String, results: Seq[Content]): Seq[Content] =
    results filterNot (_.id == itemId) sortBy publishedDateTime
}
