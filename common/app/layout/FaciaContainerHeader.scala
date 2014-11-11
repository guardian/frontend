package layout

import model.Tag
import org.joda.time.LocalDate
import org.joda.time.format.DateTimeFormat

object FaciaContainerHeader {
  def fromTagPage(tagPage: Tag, dateHeadline: DateHeadline): FaciaContainerHeader = {
    if (tagPage.isFootballTeam) {
      FootballTeamHeader(
        tagPage.webTitle,
        tagPage.url,
        tagPage.getFootballBadgeUrl,
        tagPage.description,
        dateHeadline
      )
    } else if (tagPage.isContributor) {
      ContributorMetaDataHeader(
        tagPage.webTitle,
        tagPage.url,
        Some(tagPage.bio).filter(_.nonEmpty) orElse tagPage.description,
        dateHeadline
      )
    } else {
      TagMetaDataHeader(
        tagPage.webTitle,
        tagPage.url,
        tagPage.description,
        dateHeadline
      )
    }
  }
}

sealed trait FaciaContainerHeader

case class FootballTeamHeader(
  displayName: String,
  href: String,
  footballBadgeUrl: Option[String],
  description: Option[String],
  dateHeadline: DateHeadline
) extends FaciaContainerHeader

case class TagMetaDataHeader(
  displayName: String,
  href: String,
  description: Option[String],
  dateHeadline: DateHeadline
) extends FaciaContainerHeader

case class ContributorMetaDataHeader(
  displayName: String,
  href: String,
  description: Option[String],
  dateHeadline: DateHeadline
) extends FaciaContainerHeader

case class LoneDateHeadline(get: DateHeadline) extends FaciaContainerHeader

sealed trait DateHeadline {
  val dateFormatString: String
  val dateTimeFormatString: String

  val day: LocalDate

  def displayString = day.toDateTimeAtStartOfDay.toString(DateTimeFormat.forPattern(dateFormatString))

  def dateTimeString = day.toDateTimeAtStartOfDay.toString(DateTimeFormat.forPattern(dateTimeFormatString))
}

case class DayHeadline(day: LocalDate) extends DateHeadline {
  override val dateFormatString: String = "d MMMM yyyy"
  override val dateTimeFormatString: String = "yyyy-MM-dd"
}

case class MonthHeadline(day: LocalDate) extends DateHeadline {
  override val dateFormatString: String = "MMMM yyyy"
  override val dateTimeFormatString: String = "yyyy-MM"
}
