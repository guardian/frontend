package implicits

import language.higherKinds
import scala.collection.LinearSeq
import scala.collection.generic.CanBuildFrom

trait Collections {

  // thanks https://gist.github.com/1189097
  implicit class Seq2Distinct[T, C[T] <: Seq[T]](tees: C[T]) {
    import collection.generic.CanBuildFrom
    import collection.mutable.{ HashSet => MutableHashSet }

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

  implicit class Traversable2ZipWith[T, C[T] <: Traversable[T]](tees: C[T]) {
    def zipWith[S](f: T => S)(
      implicit cbf: CanBuildFrom[C[(T, S)], (T, S), C[(T, S)]]): C[(T, S)] = {
      val builder = cbf()

      val rst = for (t <- tees) yield (t, f(t))
      rst foreach { builder += _ }
      builder.result
    }

    def toMapWith[S](f: T => S)(
      implicit cbf: CanBuildFrom[C[(T, S)], (T, S), C[(T, S)]]): Map[T, S] = zipWith(f).toMap
  }

  implicit class Seq2StableGroupBy[T, C[T] <: LinearSeq[T]](tees: C[T]) {
    import collection.generic.CanBuildFrom

    def stableGroupBy[S](hash: T => S)(implicit cbf: CanBuildFrom[C[(S, LinearSeq[T])], (S, LinearSeq[T]), C[(S, LinearSeq[T])]]): C[(S, LinearSeq[T])] = {
      val stableKeys: LinearSeq[S] = (tees map { hash }).distinct
      val groups: Map[S, LinearSeq[T]] = tees groupBy hash

      val rst: LinearSeq[(S, LinearSeq[T])] = Traversable2ZipWith(stableKeys) zipWith { groups(_) }

      val builder = cbf()
      rst foreach { builder += _ }
      builder.result
    }
  }
}
