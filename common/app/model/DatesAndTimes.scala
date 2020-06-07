package model

import common.Edition
import org.joda.time.{DateTime, DateTimeZone}
import org.joda.time.format.DateTimeFormat
import play.api.mvc.RequestHeader

object GUDateTimeFormat {
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

