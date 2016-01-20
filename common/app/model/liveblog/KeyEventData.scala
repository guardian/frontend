package model.liveblog

import model.liveblog.BodyBlock.{KeyEvent, SummaryEvent}
import org.scala_tools.time.Imports._

object KeyEventData {

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
