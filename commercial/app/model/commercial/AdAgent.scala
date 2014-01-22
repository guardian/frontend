package model.commercial

import common.AkkaAgent
import scala.util.Random
import scala.concurrent.duration._

trait AdAgent[T <: Ad] extends BaseAdAgent[T] {

  private lazy val agent = AkkaAgent[Seq[T]](Nil)

  def currentAds: Seq[T] = agent()

  protected def updateCurrentAds(ads: Seq[T]) = agent.alter(_ => ads)(1.seconds)

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
