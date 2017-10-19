package model.liveblog

import java.util.Locale
import implicits.Dates.CapiRichDateTime
import com.gu.contentapi.client.model.v1.{Block, MembershipPlaceholder, BlockAttributes => ApiBlockAttributes, Blocks => ApiBlocks}
import model.liveblog.BodyBlock._
import org.joda.time.format.{DateTimeFormat, ISODateTimeFormat}
import org.joda.time.{DateTime, DateTimeZone}
import org.jsoup.Jsoup

object Blocks {

  def make(blocks: ApiBlocks): Blocks = {

    def orderBlocks(blocks: Seq[BodyBlock]) =
      blocks.sortBy(-_.publishedCreatedTimestamp().getOrElse(0L)) // Negate rather than reverse result: leaves
                                                                  // order unchanged when there are no timestamps

    val bodyBlocks = orderBlocks(blocks.body.toSeq.flatMap(BodyBlock.make))
    val reqBlocks: Map[String, Seq[BodyBlock]] = blocks.requestedBodyBlocks.map { map =>
      map.toMap.mapValues(blocks => orderBlocks(BodyBlock.make(blocks)))
    }.getOrElse(Map())
    Blocks(
      totalBodyBlocks = blocks.totalBodyBlocks.getOrElse(bodyBlocks.length),
      body = bodyBlocks,
      requestedBodyBlocks = reqBlocks
    )
  }

}

case class Blocks(
  totalBodyBlocks: Int,
  body: Seq[BodyBlock],
  requestedBodyBlocks: Map[String, Seq[BodyBlock]]
)

object BodyBlock {

  def make(blocks: Seq[Block]): Seq[BodyBlock] =
    blocks.map { bodyBlock =>
        BodyBlock(bodyBlock.id,
          bodyBlock.bodyHtml,
          bodyBlock.bodyTextSummary,
          bodyBlock.title,
          BlockAttributes.make(bodyBlock.attributes),
          bodyBlock.published,
          bodyBlock.createdDate.map(_.toJoda),
          bodyBlock.firstPublishedDate.map(_.toJoda),
          bodyBlock.publishedDate.map(_.toJoda),
          bodyBlock.lastModifiedDate.map(_.toJoda),
          bodyBlock.contributors,
          bodyBlock.elements.flatMap(BlockElement.make))
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
  contributors: Seq[String],
  elements: Seq[BlockElement]
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

  lazy val url: Option[String] = elements.collectFirst {
    case TextBlockElement(Some(html)) if Jsoup.parse(html).getElementsByTag("a").size() == 1 =>
      Jsoup.parse(html).getElementsByTag("a").get(0).attr("href")
  }

  def republishedDate(timezone: DateTimeZone): Option[LiveBlogDate] = {
    firstPublishedDate.flatMap { firstPublishedDate =>
      publishedDate.filter(_ != firstPublishedDate)
    }
  }.map(LiveBlogDate.apply(_, timezone))

  def publishedCreatedDate(timezone: DateTimeZone): Option[LiveBlogDate] = firstPublishedDate.orElse(createdDate).map(LiveBlogDate.apply(_, timezone))

  def publishedCreatedTimestamp(): Option[Long] = firstPublishedDate.orElse(createdDate).map(_.getMillis())
}

object LiveBlogDate {
  def apply(dateTime: DateTime, timezone: DateTimeZone): LiveBlogDate = {
    val fullDate = ISODateTimeFormat.dateTime().withZone(DateTimeZone.UTC).print(dateTime)
    val useFormat = useFormatZone(timezone)_
    val hhmm = useFormat("HH:mm", dateTime)
    val ampm = useFormat("h.mma", dateTime).toLowerCase(Locale.ENGLISH)
    val gmt = useFormat("z", dateTime)
    LiveBlogDate(fullDate, hhmm, ampm, gmt)
  }

  private def useFormatZone(timezone: DateTimeZone)(format: String, dateTime: DateTime) =
    dateTime.toString(DateTimeFormat.forPattern(format).withZone(timezone))

}
case class LiveBlogDate(fullDate: String, hhmm: String, ampm: String, gmt: String)

object BlockAttributes {
  def make(blockAttributes: ApiBlockAttributes): BlockAttributes =
    new BlockAttributes(blockAttributes.keyEvent.getOrElse(false), blockAttributes.summary.getOrElse(false), blockAttributes.membershipPlaceholder)
}

case class BlockAttributes(keyEvent: Boolean, summary: Boolean, membershipPlaceholder: Option[MembershipPlaceholder])
