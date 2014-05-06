package football.model

import java.net.URLEncoder


case class SnapFields(`type`: String, uri: String, fallbackUrl: String, fallbackHeadline: String, fallbackTrailtext: String) {
  private implicit class RichString(string: String) {
    def encode = URLEncoder.encode(string, "UTF-8")
  }

  val snapUrl = s"$fallbackUrl?gu-snapType=${`type`.encode}&gu-snapUri=${uri.encode}&gu-headline=${fallbackHeadline.encode}&gu-trailText=${fallbackTrailtext.encode}"
}
