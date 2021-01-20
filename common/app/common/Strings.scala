package common

object Strings {
  object / {
    val Matcher = """^([^/]+)/(.*)$""".r

    def unapply(s: String): Option[(String, String)] =
      s match {
        case Matcher(before, after) => Some((before, after))
        case _                      => None
      }
  }
}
