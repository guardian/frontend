package layout

import common.Pagination
import model.{Page, Section, Tag}
import org.joda.time.LocalDate
import org.joda.time.format.DateTimeFormat
import services.ConfigAgent

sealed trait FaciaHeaderImageType

/** TODO fancy cut out version */
case object ContributorCutOutImage extends FaciaHeaderImageType

case object ContributorCircleImage extends FaciaHeaderImageType
case object FootballBadge extends FaciaHeaderImageType

case class FaciaHeaderImage(
  url: String,
  imageType: FaciaHeaderImageType
) {
  def cssClasses = Seq(
    "index-page-header__image-wrapper",
    imageType match {
      case ContributorCircleImage => "index-page-header__image-wrapper--contributor-circle"
      case ContributorCutOutImage => "index-page-header__image-wrapper--contributor-cut-out"
      case FootballBadge => "index-page-header__image-wrapper--football-badge"
    }
  )
}

object FaciaContainerHeader {
  def fromSection(sectionPage: Section, dateHeadline: DateHeadline): FaciaContainerHeader = MetaDataHeader(
    sectionPage.webTitle,
    None,
    sectionPage.description,
    dateHeadline,
    frontHref(sectionPage.id, sectionPage.pagination)
  )

  def fromPage(page: Page, dateHeadline: DateHeadline): FaciaContainerHeader = {
    MetaDataHeader(
      page.webTitle,
      None,
      None,
      dateHeadline,
      frontHref(page.id, page.pagination)
    )
  }

  def fromTagPage(tagPage: Tag, dateHeadline: DateHeadline): FaciaContainerHeader = {
    if (tagPage.isFootballTeam) {
      MetaDataHeader(
        tagPage.webTitle,
        tagPage.getFootballBadgeUrl.map(FaciaHeaderImage(_, FootballBadge)),
        tagPage.description,
        dateHeadline,
        frontHref(tagPage.id, tagPage.pagination)
      )
    } else if (tagPage.isContributor) {
      MetaDataHeader(
        tagPage.webTitle,
        tagPage.contributorImagePath.map(FaciaHeaderImage(_, ContributorCircleImage)),
        Some(tagPage.bio).filter(_.nonEmpty) orElse tagPage.description,
        dateHeadline,
        frontHref(tagPage.id, tagPage.pagination)
      )
    } else {
      MetaDataHeader(
        tagPage.webTitle,
        None,
        tagPage.description,
        dateHeadline,
        frontHref(tagPage.id, tagPage.pagination)
      )
    }
  }

  /** Want to show a link to the front if it exists, or to the first page of the tag page if we're not on that page */
  private def frontHref(id: String, pagination: Option[Pagination]) =
    if (ConfigAgent.shouldServeFront(id) || pagination.exists(_.currentPage > 1)) {
      Some(s"/$id")
    } else {
      None
    }
}

sealed trait FaciaContainerHeader

case class MetaDataHeader(
  displayName: String,
  image: Option[FaciaHeaderImage],
  description: Option[String],
  dateHeadline: DateHeadline,
  href: Option[String]
) extends FaciaContainerHeader

case class LoneDateHeadline(get: DateHeadline) extends FaciaContainerHeader

object DateHeadline {
  def cardTimestampDisplay(dateHeadline: DateHeadline) = dateHeadline match {
    case _: DayHeadline => TimeTimestamp
    case _: MonthHeadline => DateTimestamp
  }
}

sealed trait DateHeadline {
  val dateFormatString: String

  val dateTimeFormatString: String

  // TODO add a month endpoint and then make this non-optional
  val urlFragmentFormatString: Option[String]

  val day: LocalDate

  def displayString = day.toDateTimeAtStartOfDay.toString(DateTimeFormat.forPattern(dateFormatString))

  def dateTimeString = day.toDateTimeAtStartOfDay.toString(DateTimeFormat.forPattern(dateTimeFormatString))

  def urlFragment = urlFragmentFormatString map { format =>
    day.toDateTimeAtStartOfDay.toString(DateTimeFormat.forPattern(format)).toLowerCase
  }
}

case class DayHeadline(day: LocalDate) extends DateHeadline {
  override val dateFormatString: String = "d MMMM yyyy"
  override val dateTimeFormatString: String = "yyyy-MM-dd"
  override val urlFragmentFormatString: Option[String] = Some("yyyy/MMM/dd")
}

case class MonthHeadline(day: LocalDate) extends DateHeadline {
  override val dateFormatString: String = "MMMM yyyy"
  override val dateTimeFormatString: String = "yyyy-MM"
  override val urlFragmentFormatString: Option[String] = None
}
