package model.commercial.soulmates

import model.commercial.{Ad, Segment}

case class Member(username: String, gender: Gender, age: Int, profilePhoto: String, location: String) extends Ad {

  val profileId: Option[String] = profilePhoto match {
    case Member.IdPattern(id) => Some(id)
    case _ => None
  }

  val profileUrl: String = profileId.map(id => s"https://soulmates.theguardian.com/profile/$id")
    .getOrElse("http://soulmates.theguardian.com/")

  def isTargetedAt(segment: Segment) = true
}
object Member {
  val IdPattern = """.*/([0-9a-f]+)/.*""".r
}


case class Gender(name: String) {
  override def toString = name
}

object Woman extends Gender("Woman")

object Man extends Gender("Man")
