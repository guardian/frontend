package crosswords

import common.AutoRefresh

import scala.concurrent.Future
import scala.concurrent.duration._

object TodaysCrosswordGrid extends AutoRefresh[CrosswordGrid](0.seconds, 1.minute) {
  override protected def refresh(): Future[CrosswordGrid] = maybeApi map { api =>
    api.forToday map { dayResponse =>
      dayResponse.crosswords.values.toSeq.headOption.map(CrosswordGrid.fromCrossword) getOrElse CrosswordGrid.DefaultTreat
    }
  } getOrElse Future.successful(CrosswordGrid.DefaultTreat)
}
