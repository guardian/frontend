package views.support

import model.MetaData
import play.api.mvc.RequestHeader

object HasClassicVersion {
  def apply(page: MetaData)(implicit request: RequestHeader): Boolean = {
    val forcedFromCdn = request.headers.get("X-GU-Next-Gen-Only").exists(_ == "true")
    page.hasClassicVersion && !forcedFromCdn
  }
}
