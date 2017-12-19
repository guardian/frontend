package services

import com.gu.commercial.branding.Branding
import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import common.{Edition, LinkTo}
import contentapi.Paths
import layout._
import model._
import model.meta.{ItemList, ListItem}
import model.pressed._
import org.joda.time.{DateTime, DateTimeZone}
import play.api.mvc.RequestHeader
import views.support.PreviousAndNext


object TagPagePagination {
  def pageSize: Int = 20
}

object TagPage {

  def apply(
    page: Page,
    contents: Seq[FrontPageItem],
    tags: Tags,
    date: DateTime,
    tzOverride: Option[DateTimeZone]
  ): TagPage = {
    TagPage(page, contents, tags, date, tzOverride, commercial = Commercial.empty)
  }

}

case class TagPage(
  page: Page,
  contents: Seq[FrontPageItem],
  tags: Tags,
  date: DateTime,
  tzOverride: Option[DateTimeZone],
  commercial: Commercial,
  previousAndNext: Option[PreviousAndNext] = None
) extends FrontPage {

  private def isSectionKeyword(sectionId: String, id: String) = Set(
    Some(s"$sectionId/$sectionId"),
    Paths.withoutEdition(sectionId) map { idWithoutEdition => s"$idWithoutEdition/$idWithoutEdition" }
  ).flatten contains id


  private def isTagWithId(id: String): Boolean = page match {
    case section: Section =>
      isSectionKeyword(section.metadata.id, id)

    case tag: Tag => tag.id == id

    case combiner: TagCombiner =>
      combiner.leftTag.id == id || combiner.rightTag.id == id

    case _ => false
  }

  private def forcesDayView: Boolean = page match {
    case tag: Tag if tag.metadata.sectionId == "crosswords" => false
    case tag: Tag => Set("Series", "Blog").contains(tag.properties.tagType)
    case _ => false
  }

  def isFootballTeam: Boolean = page match {
    case tag: Tag => tag.isFootballTeam
    case _ => false
  }

  override def hideCutOuts: Boolean = tags.isContributorPage
  def idWithoutEdition: String = page match {
    case section: Section if section.isEditionalised => Paths.stripEditionIfPresent(section.metadata.id)
    case other => other.metadata.id
  }
  override def bylineTransformer: Option[Byline] => Option[Byline] = byline => if (tags.isContributorPage) None else byline
  override def isSlow: Boolean = SlowOrFastByTrails.isSlow(trails.map(_.trail))
  override def kickerTransformer: ItemKicker => Option[ItemKicker] = kicker => {
    val isCartoonPage = isTagWithId("type/cartoon")
    val isReviewPage = isTagWithId("tone/reviews")
    kicker match {
      case ReviewKicker if isReviewPage => None
      case CartoonKicker if isCartoonPage => None
      case TagKicker(_, _, _, id) if isTagWithId(id) => None
      case otherKicker => Some(otherKicker)
    }
  }
  override def grouping: Edition => Seq[FrontPageGrouping] = (edition) => if (isSlow || forcesDayView)
    FrontPageGrouping.byDay(trails, edition.timezone)
  else
    FrontPageGrouping.fromContent(trails, edition.timezone)


  def allPath: String = s"/$idWithoutEdition"

  def branding(edition: Edition): Option[Branding] = page.metadata.commercial.flatMap(_.branding(edition))
}
