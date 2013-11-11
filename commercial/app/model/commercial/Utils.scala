package model.commercial

object Utils {

  def intersects(set1: Set[String], set2: Set[String]) = !(set1 & set2).isEmpty

}
