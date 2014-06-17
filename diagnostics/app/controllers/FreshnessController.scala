package controllers

import common._
import play.api.mvc.{ Content => _, _ }
import model.diagnostics.freshness.FreshnessMetrics

object FreshnessController extends Controller with implicits.Numbers with Logging {

  private val hour = 60 * 60

  import FreshnessMetrics._

  def freshnessFront(timestamp: String) = Action { implicit request =>
    if (timestamp.isLong) {
      val secondsOld = (System.currentTimeMillis - timestamp.toLong) / 1000
      frontFreshnessCount.increment()
      frontFreshnessTotal.add(secondsOld)
    }
    OnePix()
  }

  def freshness(timestamp: String) = Action { implicit request =>

    if (timestamp.isLong) {
      (System.currentTimeMillis - timestamp.toLong) / 1000 match {
        case seconds if seconds < 0 =>
          lessThanZeroSeconds.increment()
          logStale(seconds, request)
        case seconds if seconds <= 60 => lessThanAMinute.increment()
        case seconds if seconds <= 60 * 15 => lessThanFifteenMinutes.increment()

        case seconds if seconds <= hour =>
          lessThanAnHour.increment()
          if (seconds > 60 * 18) {
            // just giving it a bit of leeway here, 15 minutes is a valid time, and I am not interested in a little bit
            // more than that
            logStale(seconds, request)
          }
        case seconds if seconds <= hour * 2 =>
          lessThanTwoHours.increment()
          logStale(seconds, request)
        case seconds if seconds <= hour * 24 =>
          lessThanADay.increment()
          logStale(seconds, request)
        case seconds =>
          moreThanADay.increment()
          logStale(seconds, request)
      }
    }

    OnePix()
  }

  private def logStale(seconds: Long, request: RequestHeader) = {
    val originPage = request.headers.get("Referer").getOrElse("unknown page")
    val browser = request.headers.get("User-Agent").getOrElse("unknown browser")
    log.info(s"STALE ${seconds}s $originPage $browser")
  }

}
