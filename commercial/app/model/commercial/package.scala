package model

package object commercial {

  def intersects[T](seq1: Seq[T], seq2: Seq[T]) = !(seq1 intersect seq2).isEmpty

  object OptString {
    def apply(s: String): Option[String] = Option(s) filter (_.trim.nonEmpty)
  }

  def lastPart(keywordId: String): String = keywordId.split('/').takeRight(1)(0)

  def lastPart(keywordIds: Seq[String]): Seq[String] = (keywordIds map lastPart).distinct
}
