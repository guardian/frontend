package model.commercial

object Utils {

  def intersects[T](set1: Set[T], set2: Set[T]) = !(set1 & set2).isEmpty

}
