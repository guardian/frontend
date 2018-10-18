package common

import scala.util.matching.Regex

object Strings {
  object / {
    val Matcher: Regex = """^([^/]+)/(.*)$""".r

    def unapply(s: String): Option[(String, String)] = s match {
      case Matcher(before, after) => Some((before, after))
      case _ => None
    }
  }
}
