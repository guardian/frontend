package model.commercial

object Utils {

  def intersects[T](seq1: Seq[T], seq2: Seq[T]) = !(seq1 intersect seq2).isEmpty

  object OptString {
    def apply(s: String): Option[String] = Option(s) filter (_.trim.nonEmpty)
  }

}
