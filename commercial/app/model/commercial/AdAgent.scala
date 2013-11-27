package model.commercial

import common.AkkaAgent
import scala.util.Random

trait AdAgent[T <: Ad] {

  private lazy val agent = AkkaAgent[Seq[T]](Nil)

  def currentAds: Seq[T] = agent()

  protected def updateCurrentAds(ads: Seq[T]) = agent send ads

  def adsTargetedAt(segment: Segment, adsToChooseFrom: Seq[T] = currentAds): Seq[T] = {
    // TODO: reinstate repeatVisitor condition when the time is right
    //adsToChooseFrom filter (segment.isRepeatVisitor && _.matches(segment))
    Random.shuffle(adsToChooseFrom filter (_.isTargetedAt(segment)))
  }

  def stop() {
    agent.close()
  }

}
