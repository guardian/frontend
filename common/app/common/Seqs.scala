package common

object Seqs {
  implicit class RichSeq[A](as: Seq[A]) {
    def frequencies: Map[A, Int] = as.groupBy(identity).mapValues(_.length)
  }
}
