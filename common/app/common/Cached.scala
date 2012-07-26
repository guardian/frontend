package common

import play.api.mvc.PlainResult

object Cached {
  def apply(seconds: Int)(result: PlainResult) =
    result.withHeaders("Cache-Control" -> "must-revalidate, max-age=%s".format(seconds))
}