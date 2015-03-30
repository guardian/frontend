package common

object Maps {
  /** Insert k -> v into map, resolving collisions with f */
  def insertWith[A, B](map: Map[A, B], k: A, v: B)(f: (B, B) => B) =
    map + (k -> map.get(k).map(f.curried(v)).getOrElse(v))

  implicit class RichMap[A, B](map: Map[A, B]) {
    /** Obviously, if you get a collision, you're going to lose a pair */
    def mapKeys[C](f: A => C) =
      (map.toSeq map {
        case (k, v) => (f(k), v)
      }).toMap

    def reverseMap = (map.toSeq map { case (a, b) => (b, a) }).toMap
  }

  implicit class RichMapSeq[A, B](map: Map[A, Seq[B]]) {
    def meanFrequency = map.values.map(_.length.toDouble).sum / map.size
  }
}
