package controllers

import org.apache.commons.codec.binary.Base64
import play.api.mvc.Results
import model.NoCache

object OnePix extends Results {
  private lazy val gif = {
    val data = "R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="
    NoCache(Ok(Base64.decodeBase64(data.getBytes("utf-8")).toArray).as("image/gif"))
  }
  def apply() = gif
}
