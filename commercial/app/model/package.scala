package model

package object commercial {
  object OptString {
    def apply(s: String): Option[String] = Option(s) filter (_.trim.nonEmpty)
  }
}

case class Context(section: Option[String], keywords: Seq[String]) {

  def isInSection(name: String) = section exists (_ == name)
}

case class Segment(context: Context, userSegments: Seq[String]) {

  val isRepeatVisitor = userSegments contains "repeat"
}
