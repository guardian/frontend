package lib

import scala.util.Try

object IntString {
  def unapply(s: String): Option[Int] = {
    Try {
      s.toInt
    }.toOption
  }
}
