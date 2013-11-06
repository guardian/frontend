package model.commercial


case class Segment(keywords: Seq[String], userSegments: Seq[String]) {

  def isRepeatVisitor = userSegments contains "repeat"
}
