package model.commercial

import common.AkkaAgent
import scala.util.Random
import scala.concurrent.duration._

trait AdAgent[T <: Ad] {

  private lazy val agent = AkkaAgent[Seq[T]](Nil)

  def currentAds: Seq[T] = agent()

  protected def updateCurrentAds(ads: Seq[T]) = agent.alter(_ => ads)(1.seconds)

  def adsTargetedAt(segment: Segment, adsToChooseFrom: Seq[T] = currentAds): Seq[T] = {
    Random.shuffle(adsToChooseFrom filter (segment.isRepeatVisitor && _.isTargetedAt(segment)))
  }

  def stop() {
    agent.close()
  }

}
