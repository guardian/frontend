package model.commercial


case class Context(section: Option[String], keywords: Seq[String]) {

  def isInSection(name: String) = section exists (_ == name)
}

case class Segment(context: Context, userSegments: Seq[String]) {

  val isRepeatVisitor = userSegments contains "repeat"
}
