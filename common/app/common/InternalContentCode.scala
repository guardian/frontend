package common

object InternalContentCode {
  def toFormattedInternalContentCode(code: String): String =
    s"internal-code/content/$code"
}
