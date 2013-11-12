package model.commercial

object Utils {

  def intersects(set1: Set[String], set2: Set[String]) = !(set1 & set2).isEmpty

  object OptString {
    def apply(s: String): Option[String] = Option(s) filter (_.trim.nonEmpty)
  }

}
