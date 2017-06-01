package views.support

object CamelCase {
  def fromHyphenated(s: String): String =
    s.split("-").toList match {
      case first :: rest =>
        first + rest.map(_.capitalize).mkString("")
      case Nil => ""
    }
}
