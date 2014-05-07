package football.model

import java.net.URLEncoder


case class SnapFields(`type`: String, `css`: String, uri: String, fallbackUrl: String, fallbackHeadline: String, fallbackTrailtext: String) {
  private implicit class RichString(string: String) {
    def encode = URLEncoder.encode(string, "UTF-8")
  }

  val snapUrl = s"$fallbackUrl?snap-type=${`type`.encode}&snap-css=${`css`.encode}&snap-uri=${uri.encode}&snap-headline=${fallbackHeadline.encode}&snap-trailText=${fallbackTrailtext.encode}"
}
