package common

import com.madgag.scala.collection.decorators.MapDecorator

object Seqs {
  implicit class RichSeq[A](as: Seq[A]) {
    def frequencies: Map[A, Int] = as.groupBy(identity).mapV(_.length)

    def isDescending(implicit ordering: Ordering[A]): Boolean = as == reverseSorted

    def reverseSorted(implicit ordering: Ordering[A]): Seq[A] = as.sorted(ordering.reverse)

    def countWhile(f: A => Boolean): Int = as.takeWhile(f).length

    def around(maxBefore: Int, windowSize: Int)(f: A => Boolean): Option[Seq[A]] = {
      require(maxBefore <= windowSize, "maxBefore is greater than windowSize, meaning window would not include item")
      as.indexWhere(f) match {
        case -1 => None

        case index =>
          val start = (index - maxBefore) max 0

          Some(as.slice(start, start + windowSize))
      }
    }

    def filterByIndex(f: Int => Boolean): Seq[A] =
      as.zipWithIndex collect {
        case (a, index) if f(index) => a
      }
  }
}
