package model.commercial

import common.AkkaAgent

trait Ad {

  def matches(segment: Segment): Boolean

}

trait AdAgent[T <: Ad] {

  private lazy val agent = AkkaAgent[Seq[T]](Nil)

  protected def currentAds: Seq[T] = agent()

  protected def updateCurrentAds(ads: Seq[T]) = agent send ads

  def matchingAds(segment: Segment, adsToChooseFrom: Seq[T] = currentAds): Seq[T] = {
    adsToChooseFrom filter (segment.isRepeatVisitor && _.matches(segment))
  }

}
