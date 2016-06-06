package model

case class SubjectsListing() extends StandalonePage {
  override val metadata = MetaData.make(
    id = "index/subjects",
    sectionSummary = Some(SectionSummary.fromId("Index")),
    analyticsName = "Subjects",
    webTitle = "subjects",
    customSignPosting = Some(IndexNav.keywordsAlpha))
}

case class ContributorsListing() extends StandalonePage {
  override val metadata = MetaData.make(
    id = "index/contributors",
    sectionSummary = Some(SectionSummary.fromId("Index")),
    analyticsName = "Contributors",
    webTitle = "contributors",
    customSignPosting = Some(IndexNav.contributorsAlpha))
}
