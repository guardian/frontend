package common

object Maps {
  /** Insert k -> v into map, resolving collisions with f */
  def insertWith[A, B](map: Map[A, B], k: A, v: B)(f: (B, B) => B) =
    map + (k -> map.get(k).map(f.curried(v)).getOrElse(v))
}
