package common

object Seqs {
  implicit class RichSeq[A](as: Seq[A]) {
    def frequencies: Map[A, Int] = as.groupBy(identity).mapValues(_.length)

    def isDescending(implicit ordering: Ordering[A]) = as == reverseSorted

    def reverseSorted(implicit ordering: Ordering[A]) = as.sorted(ordering.reverse)

    def countWhile(f: A => Boolean) = as.takeWhile(f).length

    def mapHead[B](f: A => A) = as match {
      case h :: t => f(h) :: t
      case Nil => Nil
    }
  }
}
