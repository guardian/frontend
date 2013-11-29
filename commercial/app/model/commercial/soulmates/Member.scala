package model.commercial.soulmates

import model.commercial.{Ad, Segment}

case class Member(username: String, gender: Gender, age: Int, profilePhoto: String) extends Ad {

  def isTargetedAt(segment: Segment) = true

}

case class Gender(name: String) {
  override def toString = name
}

object Woman extends Gender("Woman")

object Man extends Gender("Man")
