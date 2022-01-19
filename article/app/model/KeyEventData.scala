package model

import model.liveblog.BodyBlock.{KeyEvent, SummaryEvent}
import model.liveblog.{Blocks, BodyBlock, LiveBlogDate}
import com.github.nscala_time.time.Imports._

object KeyEventData {

  // just for convenience for use from the templates
  def apply(maybeBlocks: Option[Blocks], timezone: DateTimeZone, filterKeyEvents: Boolean): Seq[KeyEventData] = {
    val blocks = maybeBlocks.toSeq.flatMap(blocks => {
      if (blocks.body.length > 0) {
        blocks.body.filter(block => block.eventType == SummaryEvent || block.eventType == KeyEvent)
      } else {
        val keyEvent = blocks.requestedBodyBlocks.getOrElse(CanonicalLiveBlog.timeline, Seq())
        val summaryEvent = blocks.requestedBodyBlocks.getOrElse(CanonicalLiveBlog.summary, Seq())
        keyEvent ++ summaryEvent
      }
    })
    apply(blocks, timezone, filterKeyEvents)
  }

  def apply(blocks: Seq[BodyBlock], timezone: DateTimeZone, filterKeyEvents: Boolean): Seq[KeyEventData] = {
    val TimelineMaxEntries = 7
    val timelineBlocks = blocks.sortBy(_.publishedCreatedTimestamp).reverse.take(TimelineMaxEntries)
    timelineBlocks.map { bodyBlock =>
      KeyEventData(bodyBlock.id, bodyBlock.referenceDateForDisplay().map(LiveBlogDate(_, timezone)), bodyBlock.title)
    }
  }

}

case class KeyEventData(id: String, time: Option[LiveBlogDate], title: Option[String])
