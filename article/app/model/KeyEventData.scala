package model

import model.liveblog.BodyBlock.{KeyEvent, SummaryEvent}
import model.liveblog.{Blocks, BodyBlock, LiveBlogDate}
import com.github.nscala_time.time.Imports._

object KeyEventData {

  // just for convenience for use from the templates
  def apply(maybeBlocks: Option[Blocks], timezone: DateTimeZone): Seq[KeyEventData] = {
    val blocks = maybeBlocks.toSeq.flatMap(blocks => {
      if (blocks.body.length > 0) {
        blocks.body.filter(block => block.eventType == SummaryEvent || block.eventType == KeyEvent)
      } else {
        val keyEvent = blocks.requestedBodyBlocks.getOrElse(CanonicalLiveBlog.timeline, Seq())
        val summaryEvent = blocks.requestedBodyBlocks.getOrElse(CanonicalLiveBlog.summary, Seq())
        keyEvent ++ summaryEvent
      }
    })
    apply(blocks, timezone)
  }

  def apply(blocks: Seq[BodyBlock], timezone: DateTimeZone): Seq[KeyEventData] = {
    val TimelineMaxEntries = 7
    val timelineBlocks = blocks.sortBy(_.publishedCreatedTimestamp()).reverse.take(TimelineMaxEntries)
    timelineBlocks.map { bodyBlock =>
      /*
    Composer should set a default title of `Summary` on summary blocks but instead it allows title to be empty (None).
    Until this work is complete, the following pattern match ensures we set a default title of `Summary`
       */
      val title = bodyBlock.eventType match {
        case SummaryEvent if bodyBlock.title.isEmpty => Some("Summary")
        case _                                       => bodyBlock.title
      }
      KeyEventData(bodyBlock.id, bodyBlock.referenceDateForDisplay().map(LiveBlogDate(_, timezone)), title)
    }
  }

}

case class KeyEventData(id: String, time: Option[LiveBlogDate], title: Option[String])
