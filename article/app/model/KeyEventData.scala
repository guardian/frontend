package model

import model.liveblog.BodyBlock.{KeyEvent, SummaryEvent}
import model.liveblog.{Blocks, BodyBlock, LiveBlogDate}
import com.github.nscala_time.time.Imports._

object KeyEventData {

  // just for convenience for use from the templates
  def apply(maybeBlocks: Option[Blocks], timezone: DateTimeZone): Seq[KeyEventData] = {

    val blocks =
      maybeBlocks.toSeq.flatMap(blocks => blocks.requestedBodyBlocks.getOrElse(CanonicalLiveBlog.timeline, blocks.body))

    apply(blocks, timezone)
  }

  def apply(blocks: Seq[BodyBlock], timezone: DateTimeZone): Seq[KeyEventData] = {

    val TimelineMaxEntries = 7
    val latestSummary = blocks.find(_.eventType == SummaryEvent)
    val keyEvents = blocks.filter(_.eventType == KeyEvent)
    val bodyBlocks =
      (latestSummary.toSeq ++ keyEvents).sortBy(_.publishedCreatedTimestamp).reverse.take(TimelineMaxEntries)

    bodyBlocks.map { bodyBlock =>
      KeyEventData(bodyBlock.id, bodyBlock.referenceDateForDisplay().map(LiveBlogDate(_, timezone)), bodyBlock.title)
    }
  }

}

case class KeyEventData(id: String, time: Option[LiveBlogDate], title: Option[String])
