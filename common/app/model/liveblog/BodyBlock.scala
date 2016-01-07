package model.liveblog

import java.util.Locale

import com.gu.contentapi.client.model.v1.{Blocks, BlockAttributes => ApiBlockAttributes}
import common.Edition
import model.liveblog.BodyBlock._
import org.joda.time.{DateTimeZone, DateTime}
import org.joda.time.format.{DateTimeFormat, ISODateTimeFormat}
import play.api.mvc.RequestHeader

object BodyBlock {

  def make(maybeBlocks: Option[Blocks]): Seq[BodyBlock] =
    maybeBlocks.toSeq.flatMap { blocks =>
      blocks.body.toSeq.flatMap { maybeBodyBlocks =>
        maybeBodyBlocks.map { bodyBlock =>
          BodyBlock(bodyBlock.id,
            bodyBlock.bodyHtml,
            bodyBlock.bodyTextSummary,
            bodyBlock.title,
            BlockAttributes.make(bodyBlock.attributes),
            bodyBlock.published,
            bodyBlock.createdDate.map(d => new DateTime(d.dateTime)),
            bodyBlock.firstPublishedDate.map(d => new DateTime(d.dateTime)),
            bodyBlock.publishedDate.map(d => new DateTime(d.dateTime)),
            bodyBlock.lastModifiedDate.map(d => new DateTime(d.dateTime)),
            bodyBlock.contributors)
        }
      }
    }

  sealed trait EventType
  case object KeyEvent extends EventType
  case object SummaryEvent extends EventType
  case object UnclassifiedEvent extends EventType
}

case class BodyBlock(
  id: String,
  bodyHtml: String,
  bodyTextSummary: String,
  title: Option[String],
  attributes: BlockAttributes,
  published: Boolean,
  createdDate: Option[DateTime],
  firstPublishedDate: Option[DateTime],
  publishedDate: Option[DateTime],
  lastModifiedDate: Option[DateTime],
  contributors: Seq[String]
) {
  lazy val eventType: EventType =
    if (attributes.keyEvent) KeyEvent
    else if (attributes.summary) SummaryEvent
    else UnclassifiedEvent

  lazy val eventClass = eventType match {
    case SummaryEvent => " is-summary"
    case KeyEvent => " is-key-event"
    case UnclassifiedEvent => ""
  }

  def republishedDate(implicit request: RequestHeader): Option[LiveBlogDate] = {
    firstPublishedDate.flatMap { firstPublishedDate =>
      publishedDate.filter(_ != firstPublishedDate)
    }
  }.map(LiveBlogDate.apply)

  def publishedCreatedDate(implicit request: RequestHeader) = firstPublishedDate.orElse(createdDate).map(LiveBlogDate.apply)

}

object LiveBlogDate {
  def apply(dateTime: DateTime)(implicit request: RequestHeader): LiveBlogDate = {
    val fullDate = ISODateTimeFormat.dateTime().withZone(DateTimeZone.UTC).print(dateTime)
    val hhmm = useFormat("HH:mm", dateTime)
    val ampm = useFormat("h.mma", dateTime).toLowerCase(Locale.ENGLISH)
    val gmt = useFormat("z", dateTime)
    LiveBlogDate(fullDate, hhmm, ampm, gmt)
  }

  private def useFormat(format: String, dateTime: DateTime)(implicit request: RequestHeader) =
    dateTime.toString(DateTimeFormat.forPattern(format).withZone(Edition(request).timezone))

}
case class LiveBlogDate(fullDate: String, hhmm: String, ampm: String, gmt: String)

object BlockAttributes {
  def make(blockAttributes: ApiBlockAttributes) =
    new BlockAttributes(blockAttributes.keyEvent.getOrElse(false), blockAttributes.summary.getOrElse(false))
}

case class BlockAttributes(keyEvent: Boolean, summary: Boolean)
