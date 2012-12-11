package implicits

trait Strings {
  implicit def string2ToOptions(s: String) = new {
    lazy val toIntOption: Option[Int] = try { Some(s.toInt) } catch { case _ => None }
    lazy val toBooleanOption: Option[Boolean] = try { Some(s.toBoolean) } catch { case _ => None }
  }

  implicit def string2Dequote(s: String) = new {
    lazy val dequote = s.replace("\"", "")
  }

  implicit def string2FromLast(s: String) = new {
    def fromLast(regex: String): String = s.split(regex).last
  }
}