package model.commercial.soulmates

import model.commercial.{Ad, Segment}

case class Member(username: String, gender: String, age: Int, profilePhoto: String) extends Ad {

  def matches(segment: Segment) = true

}
