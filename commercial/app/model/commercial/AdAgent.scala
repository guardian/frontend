package model.commercial

import common.AkkaAgent

trait Ad {

  def matches(segment: Segment): Boolean

}

trait AdAgent[T <: Ad] {

  lazy val agent = AkkaAgent[Seq[T]](Nil)

  def matchingAds(segment: Segment, adsToChooseFrom: Seq[T] = agent()): Seq[T] = {
    adsToChooseFrom filter (_.matches(segment))
  }

}
