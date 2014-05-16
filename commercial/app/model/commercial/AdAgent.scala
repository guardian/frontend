package model.commercial

import common.{Logging, AkkaAgent}
import scala.concurrent.duration._
import scala.util.Random

trait AdAgent[T <: Ad] extends BaseAdAgent[T] with Logging {

  private lazy val agent = AkkaAgent[Seq[T]](Nil)

  def currentAds: Seq[T] = agent()

  protected def updateCurrentAds(freshAds: Seq[T]) = agent.alter { oldAds =>
    if (freshAds.nonEmpty) {
      freshAds
    } else {
      log.warn("Cannot update current ads because feed is empty")
      oldAds
    }
  }(1.seconds)

  def stop() {
    agent.close()
  }
}

trait BaseAdAgent[T <: Ad] {

  def currentAds: Seq[T]

  protected def updateCurrentAds(ads: Seq[T])

  def defaultAds: Seq[T] = Nil

  def adsTargetedAt(segment: Segment): Seq[T] = {
    val targetedAds = Random.shuffle(currentAds filter (_.isTargetedAt(segment)))
    if (targetedAds.isEmpty) defaultAds
    else targetedAds
  }
}
