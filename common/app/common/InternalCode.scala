package common

object InternalCode {
  def toFormattedInternalContentCode(code: String): String =
    s"internal-code/content/$code"

  def toFormattedInternalPageCode(code: String): String =
    s"internal-code/page/$code"
}
