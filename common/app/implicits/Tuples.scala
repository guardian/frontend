package implicits

trait Tuples {

  implicit class Tuple2FirstSecond[T, U](tuple: (T, U)) {
    lazy val first: T = tuple._1
    lazy val second: U = tuple._2
  }

  implicit class Tuple3FirstSecondThird[T, U, V](tuple: (T, U, V)) {
    lazy val first: T = tuple._1
    lazy val second: U = tuple._2
    lazy val third: V = tuple._3
  }

  implicit class Tuple4FirstSecondThirdFourth[T, U, V, W](tuple: (T, U, V, W)) {
    lazy val first: T = tuple._1
    lazy val second: U = tuple._2
    lazy val third: V = tuple._3
    lazy val fourth: W = tuple._4
  }
}
