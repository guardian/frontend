package services

import play.api.mvc.RequestHeader
import play.twirl.api.Html

object ApplicationsSpecial2020Election {
  def atomIdToCapiPath(atomId: String): String = {
    /*
        This function transforms and atom id
          "interactives/2020/07/interactive-vaccine-tracker/default"
        into the corresponding amp capi query path
          "atom/interactive/interactives/2020/07/interactive-vaccine-tracker/amp-page"

        I realise that this code is a little bit fragile, hopefully we will double check beforehand
        that the logic still applies for the election result tracker.
     */
    (Array("atom", "interactive") ++ atomId.split("/").dropRight(1) ++ Array("amp-page")).mkString("/")
  }

  def ampTagHtml(path: String)(implicit request: RequestHeader): Html = {
    ApplicationsDotcomRenderingInterface.getRenderingTier(path) match {
      case Election2020Hack => {
        Html(
          // The following simple string interpolation wasn't compiling.
          // (probable reason: Proximity of string interpolation and quote escaping.)
          // s"<link rel=\"amphtml\" href=\"https://amp.theguardian.com/${path}\">",

          // Going for another solution then
          Array("<link rel=\"amphtml\" href=\"https://amp.theguardian.com/", path, "\">").mkString(""),
        )
      }
      case _ => Html("")
    }
  }
}
