package liveblog

import model.liveblog.BodyBlock.{KeyEvent, SummaryEvent}
import model.liveblog.{Blocks, BodyBlock, LiveBlogDate}
import org.scala_tools.time.Imports._

object KeyEventData {

  // just for convenience for use from the templates
  def apply(maybeBlocks: Option[Blocks], timezone: DateTimeZone): Seq[KeyEventData] = {

    val blocks = maybeBlocks.toSeq.flatMap(blocks => blocks.requestedBodyBlocks.getOrElse(Canonical.timeline, blocks.body))

    apply(blocks, timezone)
  }

  def apply(blocks: Seq[BodyBlock], timezone: DateTimeZone): Seq[KeyEventData] = {

    val TIMELINE_MAX_ENTRIES = 7

    blocks.foldLeft((false, Nil: List[BodyBlock])) {
      case ((summaryFound, soFar), nextBlock) if !summaryFound && nextBlock.eventType == SummaryEvent => (true, nextBlock :: soFar)
      case ((summaryFound, soFar), nextBlock) if nextBlock.eventType == KeyEvent => (summaryFound, nextBlock :: soFar)
      case ((summaryFound, soFar), _) => (summaryFound, soFar)
    }._2.reverse.take(TIMELINE_MAX_ENTRIES).map { bodyBlock =>
      KeyEventData(bodyBlock.id, bodyBlock.publishedCreatedDate(timezone), bodyBlock.title)
    }
  }

}

case class KeyEventData(id: String, time: Option[LiveBlogDate], title: Option[String])
