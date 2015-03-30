package model

import play.api.mvc.{RequestHeader, Result, Results}
import org.apache.commons.codec.binary.Base64

object TinyResponse extends Results {
  lazy val gif = {
    val data = "R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="
    NoCache(Ok(Base64.decodeBase64(data.getBytes("utf-8")).toArray).as("image/gif"))
  }

  def noContent(allowedMethods: Option[String] = None)(implicit request: RequestHeader): Result = {
    Cors(NoCache(NoContent), allowedMethods)
  }

  def ok(implicit request: RequestHeader): Result = Cors(NoCache(Ok("")))
}
