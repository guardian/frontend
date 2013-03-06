package implicits

trait Strings {
  implicit class String2ToOptions(s: String) {
    lazy val toIntOption: Option[Int] = try { Some(s.toInt) } catch { case _: Throwable => None }
    lazy val toBooleanOption: Option[Boolean] = try { Some(s.toBoolean) } catch { case _: Throwable => None }
  }

  implicit class String2Dequote(s: String) {
    lazy val dequote = s.replace("\"", "")
  }

  implicit class String2FromLast(s: String) {
    def fromLast(regex: String): String = s.split(regex).last
  }
}