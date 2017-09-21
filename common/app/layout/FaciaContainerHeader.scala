package layout

import common.Pagination
import model.{ApplicationContext, Page, Section, Tag}
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
  def cssClasses: Seq[String] = Seq(
    "index-page-header__image-wrapper",
    imageType match {
      case ContributorCircleImage => "index-page-header__image-wrapper--contributor-circle"
      case ContributorCutOutImage => "index-page-header__image-wrapper--contributor-cut-out"
      case FootballBadge => "index-page-header__image-wrapper--football-badge"
    }
  )
}

object FaciaContainerHeader {
  def fromSection(sectionPage: Section, dateHeadline: DateHeadline)(implicit context: ApplicationContext): FaciaContainerHeader = MetaDataHeader(
    sectionPage.metadata.webTitle,
    None,
    sectionPage.metadata.description,
    dateHeadline,
    frontHref(sectionPage.metadata.id, sectionPage.metadata.pagination)
  )

  def fromPage(page: Page, dateHeadline: DateHeadline)(implicit context: ApplicationContext): FaciaContainerHeader = {
    MetaDataHeader(
      page.metadata.webTitle,
      None,
      None,
      dateHeadline,
      frontHref(page.metadata.id, page.metadata.pagination)
    )
  }

  def fromTagPage(tagPage: Tag, dateHeadline: DateHeadline)(implicit context: ApplicationContext): FaciaContainerHeader = {
    if (tagPage.isFootballTeam) {
      MetaDataHeader(
        tagPage.metadata.webTitle,
        tagPage.properties.footballBadgeUrl.map(FaciaHeaderImage(_, FootballBadge)),
        tagPage.metadata.description,
        dateHeadline,
        frontHref(tagPage.id, tagPage.metadata.pagination)
      )
    } else if (tagPage.isContributor) {
      MetaDataHeader(
        tagPage.metadata.webTitle,
        tagPage.contributorImagePath.map(FaciaHeaderImage(_, ContributorCircleImage)),
        tagPage.properties.bio.filter(_.nonEmpty) orElse tagPage.metadata.description,
        dateHeadline,
        frontHref(tagPage.id, tagPage.metadata.pagination)
      )
    } else {
      MetaDataHeader(
        tagPage.metadata.webTitle,
        None,
        tagPage.metadata.description,
        dateHeadline,
        frontHref(tagPage.id, tagPage.metadata.pagination)
      )
    }
  }

  /** Want to show a link to the front if it exists, or to the first page of the tag page if we're not on that page */
  private def frontHref(id: String, pagination: Option[Pagination])(implicit context: ApplicationContext) =
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

case class DescriptionMetaHeader(description: String) extends FaciaContainerHeader

object DateHeadline {
  def cardTimestampDisplay(dateHeadline: DateHeadline): FaciaCardTimestamp = dateHeadline match {
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

  def displayString: String = day.toDateTimeAtStartOfDay.toString(DateTimeFormat.forPattern(dateFormatString))

  def dateTimeString: String = day.toDateTimeAtStartOfDay.toString(DateTimeFormat.forPattern(dateTimeFormatString))

  def urlFragment: Option[String] = urlFragmentFormatString map { format =>
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
