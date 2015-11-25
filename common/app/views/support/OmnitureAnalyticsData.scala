package views.support

import java.net.URLEncoder._

import conf.Configuration
import model.{Content, MetaData}
import play.api.libs.json.{Json, JsValue, JsString}
import play.api.mvc.RequestHeader
import play.twirl.api.Html

object OmnitureAnalyticsAccount {
  def apply(page: MetaData): String = {
    val sectionSpecficAccounts = Map(
      ("guardian-masterclasses", "guardiangu-masterclasses"),
      ("Guardian Masterclasses", "guardiangu-masterclasses"),
      ("careers", "guardiangu-careers"),
      ("Guardian Careers", "guardiangu-careers")
    )
    Seq(Some(Configuration.omniture.account), sectionSpecficAccounts.get(page.section)).flatten.mkString(",")
  }
}

object OmnitureAnalyticsData {

  def apply(page: MetaData, jsSupport: String, path: String, platform: String = "frontend", extras: Map[String, String] = Map.empty)(implicit request: RequestHeader): Html = {
    val data = page.metaData map {
      case (key, JsString(s)) => key -> s
      case (key, jValue: JsValue) => key -> Json.stringify(jValue)
    }

    val pageCode = data.getOrElse("pageCode", "")
    val contentType = data.getOrElse("contentType", "")
    val section = data.getOrElse("section", "")
    val publication = data.getOrElse("publication", "")
    val omnitureEvent = data.getOrElse("omnitureEvent", "")
    val registrationType = data.getOrElse("registrationType", "")
    val omnitureErrorMessage = data.getOrElse("omnitureErrorMessage", "")

    val isContent = page match {
      case c: Content => true
      case _ => false
    }

    val pageName = page.analyticsName
    val analyticsData = Map(
      ("g", path),
      ("ns", "guardian"),
      ("pageName", pageName),
      ("cdp", "2"),
      ("v7", pageName),
      ("c3", publication),
      ("ch", section),
      ("c9", section),
      ("c4", data.getOrElse("keywords", "")),
      ("c6", data.getOrElse("author", "")),
      ("c8", pageCode),
      ("v8", pageCode),
      ("c9", contentType),
      ("c10", data.getOrElse("tones", "")),
      ("c11", section),
      ("c13", data.getOrElse("series", "")),
      ("c25", data.getOrElse("blogs", "")),
      ("c14", data("buildNumber")),
      ("c19", platform),
      ("c67", "nextgenServed"),
      ("c30", if (isContent) "content" else "non-content"),
      ("c56", jsSupport),
      ("event", omnitureEvent),
      ("v23", registrationType),
      ("e27", omnitureErrorMessage)
    ) ++ extras

    Html(analyticsData map { case (key, value) => s"$key=${encode(value, "UTF-8")}" } mkString "&")
  }
}
