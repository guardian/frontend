package services

import implicits.Collections
import model.Content
import org.joda.time.format.DateTimeFormat
import org.joda.time.{DateTimeZone, LocalDate}
import implicits.Dates._
import common.JodaTime._
import common.Maps.RichMapSeq

case class TrailAndDate(trail: Content, date: LocalDate)

object IndexPageGrouping extends Collections {
  val MinimumPerDayPopOutFrequency = 2

  def fromContent(trails: Seq[Content], timezone: DateTimeZone): Seq[IndexPageGrouping] = {
    val trailsAndDates = trails.zipWith(_.webPublicationDate.withZone(timezone).toLocalDate).map(TrailAndDate.tupled)

    trailsAndDates.groupBy(_.date.withDayOfYear(1)).toSeq.sortBy(_._1).reverse flatMap { case (startOfYear, trailsThatYear) =>
      val trailsByMonth = trailsThatYear.groupBy(_.date.withDayOfMonth(1))

      trailsByMonth.toSeq.sortBy(_._1).reverse flatMap {
        case (startOfMonth, trailsThatMonth) =>
          val trailsByDay = trailsThatMonth.groupBy(_.date)

          if (trailsByDay.meanFrequency >= MinimumPerDayPopOutFrequency) {
            trailsByDay.toSeq.sortBy(_._1).reverse map { case (day, trailsThatDay) =>
              Day(day, trailsThatDay.map(_.trail))
            }
          } else {
            Seq(Month(startOfMonth, trailsThatMonth.map(_.trail)))
          }
      }
    }
  }
}

sealed trait IndexPageGrouping {
  val dateFormatString: String
  val day: LocalDate
  val items: Seq[Content]
  def dateString = day.toDateTimeAtStartOfDay.toString(DateTimeFormat.forPattern(dateFormatString))
}

case class Day(day: LocalDate, items: Seq[Content]) extends IndexPageGrouping {
  override val dateFormatString: String = "d MMMM yyyy"
}

case class Month(day: LocalDate, items: Seq[Content]) extends IndexPageGrouping {
  override val dateFormatString: String = "MMMM yyyy"
}
