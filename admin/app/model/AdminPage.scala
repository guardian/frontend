package model

object AdminPage {
  def apply(title: String): SimplePage = SimplePage(MetaData.make(
    id = "admin-" + title,
    webTitle = title,
    analyticsName = "admin-page",
    sectionSummary = Some(SectionSummary.fromId("admin"))
  ))
}
