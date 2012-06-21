package controllers

import com.codahale.jerkson.{ Json => JsonParser }
import common.Compressed
import play.api.mvc.{ PlainResult, Result, RequestHeader, Results }
import play.api.templates.Html

object JsonComponent extends Results {
  def apply(html: Html)(implicit request: RequestHeader) = {

    val json = JsonParser.generate(Map("html" -> Compressed(html).body))

    request.getQueryString("callback").map { callback =>
      Ok("%s(%s);" format (callback, json)).as("application/javascript")
    } getOrElse (Ok(json).as("application/json"))
  }
}

object Cached {
  def apply(seconds: Int)(result: PlainResult) =
    result.withHeaders("Cache-Control" -> "must-revalidate, max-age=%s".format(seconds))
}