package common

trait InputValidation {

  val blacklist = "<>/"

  def sanitize(s: String): String = s.filterNot(blacklist.contains(_))
}

object InputValidation extends InputValidation