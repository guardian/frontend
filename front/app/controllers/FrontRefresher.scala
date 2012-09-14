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

  private var lastRefresh: DateTime = DateTime.now

  def secondsSinceLastRefresh = new Duration(lastRefresh, DateTime.now).getStandardSeconds

  def stop() {
    log.info("Stopping Front")
    refreshSchedule foreach { _.cancel() }
  }

  def start() {
    log.info("Starting Front")
    refreshSchedule = Some(play_akka.scheduler.every(refreshDuration, initialDelay = refreshDuration) {
      log.info("Refreshing Front")
      lastRefresh = DateTime.now
      Front.refresh()
    })
    Front.refresh()
  }

  def monitorStatus() {

    val lastRefresh = secondsSinceLastRefresh

    val isFresh = lastRefresh < (refreshDuration.toSeconds * 5)

    if (!isFresh) {
      log.warn("Front is not fresh - last fresh %s seconds ago" format (lastRefresh))
      play_akka.scheduler.once {
        log.warn("Restarting front refresher")
        try {
          stop()
        } catch { case e => log.error("Exception while shutting down front", e) } //just being over cautious here
        start()
      }
    }
  }
}
