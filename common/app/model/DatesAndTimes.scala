package model

import java.text.DecimalFormat

import common.Edition
import org.joda.time.{DateTime, DateTimeZone, LocalDate}
import org.joda.time.format.DateTimeFormat
import play.api.mvc.RequestHeader

case class ArticleDateTimes(
  webPublicationDate: DateTime,
  firstPublicationDate: Option[DateTime],
  hasBeenModified: Boolean,
  lastModificationDate: DateTime
)

case class DisplayedDateTimesDCR(
  firstPublished: Long,
  firstPublishedDisplay: String,
  lastUpdated: Long,
  lastUpdatedDisplay: String
)

object ArticleDateTimes {
  def makeDisplayedDateTimesDCR(articleDateTimes: ArticleDateTimes, request: RequestHeader): DisplayedDateTimesDCR = {
    val firstPublished = articleDateTimes.firstPublicationDate.getOrElse(articleDateTimes.webPublicationDate).toInstant.getMillis
    val firstPublishedDisplay = GUDateTimeFormatNew.formatTimeForDisplay(new DateTime(firstPublished), request)

    val lastUpdated = articleDateTimes.lastModificationDate.toInstant.getMillis
    val lastUpdatedDisplay = GUDateTimeFormatNew.formatTimeForDisplay(new DateTime(lastUpdated), request)

    DisplayedDateTimesDCR(
      firstPublished,
      firstPublishedDisplay,
      lastUpdated,
      lastUpdatedDisplay
    )
  }
}

/*
  date: 07th June 2020
  Note GuDateTimeFormatOld is a copy of views.support.GuDateFormatLegacy
  This is a temporary measure before decommission views.support.GuDateFormatLegacy
 */

object GuDateTimeFormatOld {
  def apply(date: DateTime, pattern: String, tzOverride: Option[DateTimeZone] = None)(implicit request: RequestHeader): String = {
    apply(date, Edition(request), pattern, tzOverride)
  }

  def apply(date: DateTime, edition: Edition, pattern: String, tzOverride: Option[DateTimeZone]): String = {
    val timeZone = tzOverride match {
      case Some(tz) => tz
      case _ => edition.timezone
    }
    date.toString(DateTimeFormat.forPattern(pattern).withZone(timeZone))
  }

  def apply(date: LocalDate, pattern: String)(implicit request: RequestHeader): String = this(date.toDateTimeAtStartOfDay, pattern)(request)

  def apply(a: Int): String = new DecimalFormat("#,###").format(a)
}

object GUDateTimeFormatNew {
  def formatDateTimeForDisplay(date: DateTime, request: RequestHeader): String = {
    val edition = Edition(request)
    formatDateTimeForDisplayGivenEdition(date: DateTime, edition: Edition)
  }
  def formatDateTimeForDisplayGivenEdition(date: DateTime, edition: Edition): String = {
    val timezone = edition.timezone
    date.toString(DateTimeFormat.forPattern("E d MMM yyyy HH.mm").withZone(timezone)) + " " + timezone.getShortName(date.getMillis)
  }
  def formatDateForDisplay(date: DateTime, request: RequestHeader): String = {
    date.toString("E d MMM yyyy")
  }
  def formatTimeForDisplay(date: DateTime, request: RequestHeader): String = {
    val edition = Edition(request)
    val timezone = edition.timezone
    edition.id match {
      case "AU" => date.toString(DateTimeFormat.forPattern("HH.mm").withZone(timezone)) + " " + timezone.getShortName(date.getMillis)
      case _ => date.toString(DateTimeFormat.forPattern("HH.mm z").withZone(timezone))
    }
  }
  def dateTimeToLiveBlogDisplay(dateTime: DateTime, timezone: DateTimeZone): String = {
    dateTime.toString(DateTimeFormat.forPattern("HH:mm z").withZone(timezone))
  }
}

