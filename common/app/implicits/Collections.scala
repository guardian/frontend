package implicits

import language.higherKinds
import scala.collection.generic.CanBuildFrom
import collection.mutable.{ HashSet => MutableHashSet }

trait Collections {

  // thanks https://gist.github.com/1189097
  implicit class Seq2Distinct[T, C[T] <: Seq[T]](tees: C[T]) {
    def distinctBy[S](hash: T => S)(implicit cbf: CanBuildFrom[C[T], T, C[T]]): C[T] = {
      val builder = cbf()
      val seen = MutableHashSet[S]()

      for (t <- tees) {
        if (!seen(hash(t))) {
          builder += t
          seen += hash(t)
        }
      }

      builder.result
    }
  }

  // A non-inlined implementation of drop while. This is needed because scala 2.11
  // currently throws warnings (fatal warnings are on) when using standard drop while.
  // https://issues.scala-lang.org/browse/SI-7529
  implicit class List2DropWhile[A](list: List[A]) {
    def safeDropWhile(p: A => Boolean): List[A] = {
      def loop(xs: List[A]): List[A] =
        if (xs.isEmpty || !p(xs.head)) xs
        else loop(xs.tail)
      loop(list)
    }
  }
}

object CollectionsOps extends Collections
