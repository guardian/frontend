package football.model

import java.net.URLEncoder

case class SnapFields(
    `type`: String,
    css: String,
    uri: String,
    fallbackUrl: String,
    fallbackHeadline: String,
    fallbackTrailtext: String,
) {
  private implicit class RichString(string: String) {
    def encode: String = URLEncoder.encode(string, "UTF-8")
  }

  val snapUrl =
    s"$fallbackUrl?gu-snapType=${`type`.encode}&gu-snapCss=${css.encode}&gu-snapUri=${uri.encode}&gu-headline=${fallbackHeadline.encode}&gu-trailText=${fallbackTrailtext.encode}"
}
