package services

import com.gu.facia.api.models.FaciaContent
import common.JodaTime._
import common.Maps.RichMapSeq
import implicits.Collections
import implicits.Dates._
import layout.{DateHeadline, DayHeadline, MonthHeadline}
import model.Content
import org.joda.time.{DateTimeZone, LocalDate}

case class TrailAndDate(trail: Content, date: LocalDate)

object IndexPageGrouping extends Collections {
  val MinimumPerDayPopOutFrequency = 2

  def fromContent(trails: Seq[Content], timezone: DateTimeZone): Seq[IndexPageGrouping] = {
    val trailsAndDates = trails.map(content => TrailAndDate(content, content.trail.webPublicationDate.withZone(timezone).toLocalDate))

    trailsAndDates.groupBy(_.date.withDayOfYear(1)).toSeq.sortBy(_._1).reverse flatMap { case (startOfYear, trailsThatYear) =>
      val trailsByMonth = trailsThatYear.groupBy(_.date.withDayOfMonth(1))

      trailsByMonth.toSeq.sortBy(_._1).reverse flatMap {
        case (startOfMonth, trailsThatMonth) =>
          val trailsByDay = trailsThatMonth.groupBy(_.date)

          if (trailsByDay.meanFrequency >= MinimumPerDayPopOutFrequency) {
            trailsByDay.toSeq.sortBy(_._1).reverse map { case (day, trailsThatDay) =>
              Day(day, trailsThatDay.map(_.trail).sortBy(_.trail.webPublicationDate).reverse)
            }
          } else {
            Seq(Month(startOfMonth, trailsThatMonth.map(_.trail).sortBy(_.trail.webPublicationDate).reverse))
          }
      }
    }
  }

  /** Sometimes we want to force a by day view in order to show off pretty images - e.g., on eyewitness */
  def byDay(trails: Seq[Content], timezone: DateTimeZone): Seq[Day] = {
    trails.groupBy(_.trail.webPublicationDate.withZone(timezone).toLocalDate).toSeq.sortBy(_._1).reverse map {
      case (date, trailsThatDay) =>
        Day(date, trailsThatDay.sortBy(_.trail.webPublicationDate).reverse)
    }
  }
}

sealed trait IndexPageGrouping {
  val day: LocalDate
  val items: Seq[Content]
  def dateHeadline: DateHeadline
}

case class Day(day: LocalDate, items: Seq[Content]) extends IndexPageGrouping {
  override def dateHeadline: DateHeadline = DayHeadline(day)
}

case class Month(day: LocalDate, items: Seq[Content]) extends IndexPageGrouping {
  override def dateHeadline: DateHeadline = MonthHeadline(day)
}
