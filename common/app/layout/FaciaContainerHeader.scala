package layout

import model.{Section, Tag}
import org.joda.time.LocalDate
import org.joda.time.format.DateTimeFormat

object FaciaContainerHeader {
  def fromSection(sectionPage: Section, dateHeadline: DateHeadline): FaciaContainerHeader = MetaDataHeader(
    sectionPage.webTitle,
    sectionPage.url,
    None,
    sectionPage.description,
    dateHeadline
  )

  def fromTagPage(tagPage: Tag, dateHeadline: DateHeadline): FaciaContainerHeader = {
    if (tagPage.isFootballTeam) {
      MetaDataHeader(
        tagPage.webTitle,
        tagPage.url,
        tagPage.getFootballBadgeUrl,
        tagPage.description,
        dateHeadline
      )
    } else if (tagPage.isContributor) {
      MetaDataHeader(
        tagPage.webTitle,
        tagPage.url,
        tagPage.contributorImagePath,
        Some(tagPage.bio).filter(_.nonEmpty) orElse tagPage.description,
        dateHeadline
      )
    } else {
      MetaDataHeader(
        tagPage.webTitle,
        tagPage.url,
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
  href: String,
  imageUrl: Option[String],
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
