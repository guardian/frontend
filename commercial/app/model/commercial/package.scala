package model

package object commercial {

  def intersects[T](seq1: Seq[T], seq2: Seq[T]) = !(seq1 intersect seq2).isEmpty

  object OptString {
    def apply(s: String): Option[String] = Option(s) filter (_.trim.nonEmpty)
  }

  def encode(keywords: Seq[String]) = keywords map (_.toLowerCase.replace(" ", "-"))
}
