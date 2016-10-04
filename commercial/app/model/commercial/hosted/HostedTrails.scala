package model.commercial.hosted

import com.gu.contentapi.client.model.v1.Content
import common.Logging
import common.commercial.hosted._

object HostedTrails extends Logging {

  /*
   * Take first n items published after given item.
   * If there aren't enough, backfill with previous items.
   */
  def fromContent(itemId: String, trailCount: Int, results: Seq[Content]): Seq[HostedPage] = {

    val (givenItemIfExists, otherItems) = results partition (_.id == itemId)

    val trails = givenItemIfExists.headOption map { givenItem =>

      def publishedDateTime(item: Content): Long = item.webPublicationDate.map(_.dateTime).getOrElse(0L)

      val (publishedBefore, publishedAfter) = otherItems.partition { item =>
        val pubDateTime = publishedDateTime(givenItem)
        publishedDateTime(item) > pubDateTime
      }

      val laterItems = publishedAfter.sortBy(publishedDateTime) take trailCount

      val itemsToInclude = {
        if (laterItems.size < trailCount) {
          publishedBefore.sortBy(publishedDateTime) take (trailCount - laterItems.size)
        } else {
          laterItems
        }
      }

      itemsToInclude.sortBy(publishedDateTime) flatMap HostedPage.fromContent

    } getOrElse Nil

    log.info {
      def mkString(ss: Seq[AnyRef]) = ss.mkString("'", "', '", "'")
      val content = mkString(results.map(item => (item.id, item.webPublicationDate.map(_.iso8601).getOrElse(""))))
      s"Tried to make $trailCount trails for item '$itemId' from content: $content.  " +
      s"Actually made ${trails.size} trails: ${mkString(trails.map(_.pageUrl))}"
    }

    trails
  }
}
