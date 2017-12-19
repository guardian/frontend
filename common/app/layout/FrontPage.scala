package layout

import common.JodaTime._
import common.Maps.RichMapSeq
import implicits.Collections
import implicits.Dates._
import model.pressed.{ItemKicker, PressedContent}
import model.{Content, ContentType, MetaData, Page, StandalonePage}
import org.joda.time.{DateTimeZone, LocalDate}
import services.FaciaContentConvert
import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import common.{Edition, LinkTo}
import model.meta.{ItemList, ListItem}
import play.api.mvc.RequestHeader


case class TrailAndDate(trail: Content, date: LocalDate)

trait FrontPage extends StandalonePage {
  def contents: Seq[FrontPageItem]
  def page: Page

  def isFootballTeam: Boolean
  def idWithoutEdition: String
  def hideCutOuts: Boolean
  def bylineTransformer: Option[Byline] => Option[Byline]
  def isSlow: Boolean
  def kickerTransformer: ItemKicker => Option[ItemKicker]
  def grouping:Edition => Seq[FrontPageGrouping]

  override val metadata: MetaData = page.metadata
  val trails: Seq[Content] = contents.map(_.item.content)
  val faciaTrails: Seq[PressedContent] = contents.map(_.faciaItem)

  def makeLinkedData(implicit request: RequestHeader): ItemList = {
    ItemList(
      LinkTo(page.metadata.url),
      trails.zipWithIndex.map {
        case (trail, index) =>
          ListItem(position = index, url = Some(LinkTo(trail.metadata.url)))
      }
    )
  }
}

object FrontPageItem {
  def apply(content: ApiContent): FrontPageItem = {
    FrontPageItem(
      Content(content),
      FaciaContentConvert.contentToFaciaContent(content))
  }
}
case class FrontPageItem(
  item: ContentType,
  faciaItem: PressedContent
)

object FrontPageGrouping extends Collections {
  val MinimumPerDayPopOutFrequency = 2

  def fromContent(trails: Seq[Content], timezone: DateTimeZone): Seq[FrontPageGrouping] = {
    val trailsAndDates = trails.map(content => TrailAndDate(content, content.trail.webPublicationDate.withZone(timezone).toLocalDate))

    trailsAndDates.groupBy(_.date.withDayOfYear(1)).toSeq.sortBy(_._1).reverse flatMap { case (_, trailsThatYear) =>
      val trailsByMonth = trailsThatYear.groupBy(_.date.withDayOfMonth(1))

      trailsByMonth.toSeq.sortBy(_._1).reverse flatMap {
        case (startOfMonth, trailsThatMonth) =>
          val trailsByDay = trailsThatMonth.groupBy(_.date)

          if (trailsByDay.meanFrequency >= MinimumPerDayPopOutFrequency) {
            trailsByDay.toSeq.sortBy(_._1).reverse map { case (day, trailsThatDay) =>
              Day(day, trailsThatDay.map(_.trail).sortBy(_.trail.webPublicationDate).reverse)
            }
          } else {
            Seq(Month(startOfMonth, trailsThatMonth.map(_.trail).sortBy(_.trail.webPublicationDate).reverse))
          }
      }
    }
  }

  /** Sometimes we want to force a by day view in order to show off pretty images - e.g., on eyewitness */
  def byDay(trails: Seq[Content], timezone: DateTimeZone): Seq[Day] = {
    trails.groupBy(_.trail.webPublicationDate.withZone(timezone).toLocalDate).toSeq.sortBy(_._1).reverse map {
      case (date, trailsThatDay) =>
        Day(date, trailsThatDay.sortBy(_.trail.webPublicationDate).reverse)
    }
  }
}

sealed trait FrontPageGrouping {
  val day: LocalDate
  val items: Seq[Content]
  def dateHeadline: DateHeadline
}

case class Day(day: LocalDate, items: Seq[Content]) extends FrontPageGrouping {
  override def dateHeadline: DateHeadline = DayHeadline(day)
}

case class Month(day: LocalDate, items: Seq[Content]) extends FrontPageGrouping {
  override def dateHeadline: DateHeadline = MonthHeadline(day)
}
