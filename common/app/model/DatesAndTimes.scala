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
    lastModificationDate: DateTime,
)

case class DisplayedDateTimesDCR(
    firstPublished: Long,
    firstPublishedDisplay: String,
    lastUpdated: Long,
    lastUpdatedDisplay: String,
    primaryDateLine: String,
    secondaryDateLine: String,
)

object ArticleDateTimes {
  def makeDisplayedDateTimesDCR(articleDateTimes: ArticleDateTimes, request: RequestHeader): DisplayedDateTimesDCR = {

    val firstPublishedDateTime = articleDateTimes.firstPublicationDate.getOrElse(articleDateTimes.webPublicationDate)
    val firstPublishedLong = firstPublishedDateTime.toInstant.getMillis
    val firstPublishedDisplay = GUDateTimeFormatNew.formatTimeForDisplay(firstPublishedDateTime, request)

    val lastUpdatedDateTime = articleDateTimes.lastModificationDate
    val lastUpdatedLong = lastUpdatedDateTime.toInstant.getMillis
    val lastUpdatedDisplay = GUDateTimeFormatNew.formatTimeForDisplay(lastUpdatedDateTime, request)

    val primaryDateLine = GUDateTimeFormatNew.formatDateTimeForDisplay(articleDateTimes.webPublicationDate, request)

    val secondaryDateLine =
      if (
        articleDateTimes.hasBeenModified && (articleDateTimes.webPublicationDate != articleDateTimes.firstPublicationDate
          .getOrElse(""))
      ) {
        "First published on " + GUDateTimeFormatNew.formatDateTimeForDisplay(
          articleDateTimes.firstPublicationDate.getOrElse(articleDateTimes.webPublicationDate),
          request,
        )
      } else {
        "Last modified on " + GUDateTimeFormatNew.formatDateTimeForDisplay(
          articleDateTimes.lastModificationDate,
          request,
        )
      }

    DisplayedDateTimesDCR(
      firstPublishedLong,
      firstPublishedDisplay,
      lastUpdatedLong,
      lastUpdatedDisplay,
      primaryDateLine,
      secondaryDateLine,
    )
  }
}

/*
  date: 07th June 2020
  Note GuDateTimeFormatOld is a copy of views.support.GuDateFormatLegacy
  This is a temporary measure before decommission views.support.GuDateFormatLegacy
 */

object GuDateTimeFormatOld {
  def apply(date: DateTime, pattern: String, tzOverride: Option[DateTimeZone] = None)(implicit
      request: RequestHeader,
  ): String = {
    apply(date, Edition(request), pattern, tzOverride)
  }

  def apply(date: DateTime, edition: Edition, pattern: String, tzOverride: Option[DateTimeZone]): String = {
    val timeZone = tzOverride match {
      case Some(tz) => tz
      case _        => edition.timezone
    }
    date.toString(DateTimeFormat.forPattern(pattern).withZone(timeZone))
  }

  def apply(date: LocalDate, pattern: String)(implicit request: RequestHeader): String =
    this(date.toDateTimeAtStartOfDay, pattern)(request)

  def apply(a: Int): String = new DecimalFormat("#,###").format(a)
}

object GUDateTimeFormatNew {
  def formatDateTimeForDisplay(date: DateTime, request: RequestHeader): String = {
    val edition = Edition(request)
    formatDateTimeForDisplayGivenEdition(date: DateTime, edition: Edition)
  }
  def formatDateTimeForDisplayGivenEdition(date: DateTime, edition: Edition): String = {
    def correctTimeZoneString(str: String): String = {
      // For some reasons For some reasons timezone.getShortName(date.getMillis) no longer returns "EDT"
      // as it used to do, but now returns "GMT-04:00". This is to correct it when that happens
      if (str == "GMT-04:00") "EDT" else str
    }
    val timezone = edition.timezone
    val timeZoneString = correctTimeZoneString(timezone.getShortName(date.getMillis))
    date.toString(DateTimeFormat.forPattern("E d MMM yyyy HH.mm").withZone(timezone)) + " " + timeZoneString
  }
  def formatDateForDisplay(date: DateTime, request: RequestHeader): String = {
    val timezone = Edition(request).timezone
    date.toString(DateTimeFormat.forPattern("E d MMM yyyy").withZone(timezone))
  }
  def formatTimeForDisplay(date: DateTime, request: RequestHeader): String = {
    val edition = Edition(request)
    val timezone = edition.timezone
    edition.id match {
      case "AU" =>
        date.toString(DateTimeFormat.forPattern("HH.mm").withZone(timezone)) + " " + timezone.getShortName(
          date.getMillis,
        )
      case _ => date.toString(DateTimeFormat.forPattern("HH.mm z").withZone(timezone))
    }
  }
  def formatTimeForDisplayNoTimezone(dateTime: DateTime, request: RequestHeader): String = {
    val edition = Edition(request)
    val timezone = edition.timezone
    dateTime.toString(DateTimeFormat.forPattern("HH.mm").withZone(timezone))
  }
}
