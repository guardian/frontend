package layout

import model.{Page, Section, Tag}
import org.joda.time.LocalDate
import org.joda.time.format.DateTimeFormat

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
    dateHeadline
  )

  def fromPage(page: Page, dateHeadline: DateHeadline): FaciaContainerHeader = {
    MetaDataHeader(
      page.webTitle,
      None,
      None,
      dateHeadline
    )
  }

  def fromTagPage(tagPage: Tag, dateHeadline: DateHeadline): FaciaContainerHeader = {
    if (tagPage.isFootballTeam) {
      MetaDataHeader(
        tagPage.webTitle,
        tagPage.getFootballBadgeUrl.map(FaciaHeaderImage(_, FootballBadge)),
        tagPage.description,
        dateHeadline
      )
    } else if (tagPage.isContributor) {
      MetaDataHeader(
        tagPage.webTitle,
        tagPage.contributorImagePath.map(FaciaHeaderImage(_, ContributorCircleImage)),
        Some(tagPage.bio).filter(_.nonEmpty) orElse tagPage.description,
        dateHeadline
      )
    } else {
      MetaDataHeader(
        tagPage.webTitle,
        None,
        tagPage.description,
        dateHeadline
      )
    }
  }
}

sealed trait FaciaContainerHeader

case class MetaDataHeader(
  displayName: String,
  image: Option[FaciaHeaderImage],
  description: Option[String],
  dateHeadline: DateHeadline
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
