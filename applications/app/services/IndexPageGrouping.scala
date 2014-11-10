package services

import model.Content
import org.joda.time.Duration
import common.JodaTime._

object IndexPageGrouping {
  def fromContent(trails: Seq[Content]): Option[IndexPageGrouping] = {
    val itemsByDay = trails.groupBy(_.webPublicationDate.toLocalDate)

    val frequency = new Duration((trails.map(_.webPublicationDate).sorted.sliding(2) map {
      case firstDate +: secondDate +: Nil => secondDate.getMillis - firstDate.getMillis
    }).sum / trails.length)

    if (itemsByDay.keySet.size == 1) {
      /** Many items are published a day, do not group */
      None
    } else if (frequency.isShorterThan(Duration.standardHours(12))) {
      Some(ByDay)
    } else if (frequency.isShorterThan(Duration.standardDays(31))) {
      Some(ByMonth)
    } else {
      Some(ByYear)
    }
  }
}

sealed trait IndexPageGrouping {
  val dateFormatString: String
}

case object ByDay extends IndexPageGrouping {
  override val dateFormatString: String = "d MMMM yyyy"
}

case object ByMonth extends IndexPageGrouping {
  override val dateFormatString: String = "MMMM yyyy"
}

case object ByYear extends IndexPageGrouping {
  override val dateFormatString: String = "yyyy"
}
