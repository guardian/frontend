package football.collections

import scala.annotation.tailrec

trait RichList {

  implicit class RichList[T](list: List[T]) {

    def segment(compare: (T, T) => Boolean = (t1: T, t2: T) => t1 == t2): List[(T, List[T])] =
      segmentByAndMap[T, T](identity, compare, identity)
    def segmentBy[U](key: T => U, compare: (U, U) => Boolean = (u1: U, u2: U) => u1 == u2): List[(U, List[T])] =
      segmentByAndMap[U, T](key, compare, identity)
    def segmentByAndMap[U, V](
        key: T => U,
        compare: (U, U) => Boolean = (u1: U, u2: U) => u1 == u2,
        mapValue: T => V,
    ): List[(U, List[V])] = {
      @tailrec
      def loop(xs: List[T], acc: List[(U, List[V])]): List[(U, List[V])] = {
        if (xs.isEmpty) acc
        else {
          val thisKey = key(xs.head)
          val (segment, tail) = xs.span(t => compare(key(t), thisKey))
          val newAccumulator = (thisKey, segment.map(mapValue)) :: acc
          loop(tail, newAccumulator)
        }
      }
      loop(list, Nil).reverse
    }

    def indexOfOpt(el: T): Option[Int] = {
      list.indexOf(el) match {
        case -1 => None
        case i  => Some(i)
      }
    }
    def indexOfOpt(el: T, from: Int): Option[Int] = {
      list.indexOf(el, from) match {
        case -1 => None
        case i  => Some(i)
      }
    }
  }
}
