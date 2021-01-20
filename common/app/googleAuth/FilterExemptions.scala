package googleAuth

import com.gu.googleauth.FilterExemption

case class FilterExemptions(additionalUrls: String*) {

  lazy val loginExemption: FilterExemption = FilterExemption("/login")
  lazy val exemptions: Seq[FilterExemption] = List(
    // Default
    FilterExemption("/oauth2callback"),
    FilterExemption("/assets"),
    FilterExemption("/favicon.ico"),
    FilterExemption("/_healthcheck"),
  ) ++ additionalUrls.map { url => FilterExemption(url) }
}
