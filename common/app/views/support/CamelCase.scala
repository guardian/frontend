package views.support

object CamelCase {
  def fromHyphenated(s: String): String =
    s.split("-").toList match {
      case first :: rest =>
        first + rest.map(_.capitalize).mkString("")
      case Nil => ""
    }

  private val lowerCaseFollowedByUpperCase = """([a-z])([A-Z])""".r
  def toHyphenated(s: String): String =
    lowerCaseFollowedByUpperCase.replaceAllIn(s, m => m.group(1) + "-" + m.group(2)).toLowerCase
}
