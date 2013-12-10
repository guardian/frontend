package model.commercial.soulmates

import model.commercial.{Ad, Segment}

case class Member(username: String, gender: Gender, age: Int, profilePhoto: String, location: String) extends Ad {

  def isTargetedAt(segment: Segment) = segment.context.isInSection("lifeandstyle")
}

case class Gender(name: String) {
  override def toString = name
}

object Woman extends Gender("Woman")

object Man extends Gender("Man")
