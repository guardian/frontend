package model


class IdentityPage(canonicalUrl: String, id: String, webTitle: String, analyticsName: String)
  extends Page(Option(canonicalUrl), id, "identity", webTitle, analyticsName)
