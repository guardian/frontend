package implicits

import language.higherKinds

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
}
