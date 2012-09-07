package controllers

import akka.actor.Cancellable
import common.{ Logging, AkkaSupport }
import front.Front
import org.joda.time.DateTime
import java.util.concurrent.TimeUnit.SECONDS

import org.scala_tools.time.Imports._

object FrontRefresher extends AkkaSupport with Logging {

  private val refreshDuration = akka.util.Duration(60, SECONDS)

  private var refreshSchedule: Option[Cancellable] = None

  private var lastRefresh: Option[DateTime] = None

  def stop() {
    log.info("Stopping Front")
    refreshSchedule foreach { _.cancel() }
  }

  def start() {
    log.info("Starting Front")
    refreshSchedule = Some(play_akka.scheduler.every(refreshDuration) {
      log.info("Refreshing Front")
      lastRefresh = Some(DateTime.now)
      Front.refresh()
    })
  }

  def monitorStatus() {
    val timeSinceLastRefresh = lastRefresh.map(new Duration(_, DateTime.now))
    val isFresh = timeSinceLastRefresh.map(_.getStandardSeconds < (refreshDuration.toSeconds * 5)) getOrElse (false)

    timeSinceLastRefresh map { time =>
      log.info("Checking front freshness - last refreshed %s seconds ago" format (time.getStandardSeconds))
    }

    if (!isFresh) {
      log.warn("Front is not fresh - last fresh at %s" format (lastRefresh))
      play_akka.scheduler.once {
        log.warn("Restarting front refresher")
        try {
          stop()
        } catch { case e => log.info("Exception while shutting down front", e) } //just being over cautious here
        start()
      }
    }
  }

}
