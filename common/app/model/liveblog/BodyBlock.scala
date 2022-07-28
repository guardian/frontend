package model.liveblog

import java.util.Locale

import com.gu.contentapi.client.model.v1.{Block, BlockAttributes => ApiBlockAttributes, Blocks => ApiBlocks}
import implicits.Dates.CapiRichDateTime
import model.liveblog.BodyBlock._
import org.joda.time.format.{DateTimeFormat, ISODateTimeFormat}
import org.joda.time.{DateTime, DateTimeZone}
import org.jsoup.Jsoup
import play.api.libs.json._

object Blocks {

  def make(blocks: ApiBlocks): Blocks = {

    def orderBlocks(blocks: Seq[BodyBlock]): Seq[BodyBlock] = {
      // Negate rather than reverse result: leaves order unchanged when there are no timestamps
      blocks.sortBy(-_.publishedCreatedTimestamp().getOrElse(0L))
    }

    val mainBlock: Option[BodyBlock] = blocks.main.map(BodyBlock.make)
    val bodyBlocks: Seq[BodyBlock] = orderBlocks(blocks.body.toSeq.flatMap(BodyBlock.make))
    val reqBlocks: Map[String, Seq[BodyBlock]] = blocks.requestedBodyBlocks
      .map { map =>
        map.toMap.mapValues(blocks => orderBlocks(BodyBlock.make(blocks)))
      }
      .getOrElse(Map())
    Blocks(
      totalBodyBlocks = blocks.totalBodyBlocks.getOrElse(bodyBlocks.length),
      body = bodyBlocks,
      main = mainBlock,
      requestedBodyBlocks = reqBlocks,
    )
  }

  implicit val blocksWrites: Writes[Blocks] = Json.writes[Blocks]

}

case class Blocks(
    totalBodyBlocks: Int,
    body: Seq[BodyBlock],
    main: Option[BodyBlock],
    requestedBodyBlocks: Map[String, Seq[BodyBlock]],
)

object BodyBlock {

  def make(blocks: Seq[Block]): Seq[BodyBlock] = {
    blocks.map(make)
  }

  def make(bodyBlock: Block): BodyBlock =
    BodyBlock(
      bodyBlock.id,
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
      bodyBlock.elements.flatMap(BlockElement.make),
    )

  sealed trait EventType
  case object KeyEvent extends EventType
  case object SummaryEvent extends EventType
  case object UnclassifiedEvent extends EventType

  implicit val dateWrites = play.api.libs.json.JodaWrites.JodaDateTimeNumberWrites
  implicit val blockElementWrites = BlockElement.blockElementWrites
  implicit val bodyBlockWrites: Writes[BodyBlock] = Json.writes[BodyBlock]
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
    elements: Seq[BlockElement],
) {
  lazy val eventType: EventType = {
    if (attributes.keyEvent) KeyEvent
    else if (attributes.summary) SummaryEvent
    else UnclassifiedEvent
  }

  lazy val eventClass = eventType match {
    case SummaryEvent      => " is-summary"
    case KeyEvent          => " is-key-event"
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

  def publishedCreatedDate(timezone: DateTimeZone): Option[LiveBlogDate] =
    firstPublishedDate.orElse(createdDate).map(LiveBlogDate.apply(_, timezone))

  def publishedCreatedTimestamp(): Option[Long] = firstPublishedDate.orElse(createdDate).map(_.getMillis())

  def referenceDateForDisplay(): Option[DateTime] = firstPublishedDate.orElse(publishedDate).orElse(createdDate)

}

object LiveBlogDate {
  def apply(dateTime: DateTime, timezone: DateTimeZone): LiveBlogDate = {
    val fullDate = ISODateTimeFormat.dateTime().withZone(DateTimeZone.UTC).print(dateTime)
    val useFormat = useFormatZone(timezone) _
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
    new BlockAttributes(
      blockAttributes.pinned.getOrElse(false),
      blockAttributes.keyEvent.getOrElse(false),
      blockAttributes.summary.getOrElse(false),
      blockAttributes.membershipPlaceholder.map(mp => MembershipPlaceholder(mp.campaignCode)),
    )

  implicit val blockAttributes: Writes[BlockAttributes] = Json.writes[BlockAttributes]

}

case class BlockAttributes(
    pinned: Boolean,
    keyEvent: Boolean,
    summary: Boolean,
    membershipPlaceholder: Option[MembershipPlaceholder],
)

case class MembershipPlaceholder(campaignCode: Option[String])
object MembershipPlaceholder {
  implicit val membershipPlaceholderWrites: Writes[MembershipPlaceholder] = Json.writes[MembershipPlaceholder]
}
