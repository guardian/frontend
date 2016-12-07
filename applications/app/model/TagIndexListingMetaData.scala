package model

case class SubjectsListing() extends StandalonePage {
  override val metadata = MetaData.make(
    id = "index/subjects",
    section = Some(SectionSummary.fromId("Index")),
    webTitle = "subjects",
    customSignPosting = Some(IndexNav.keywordsAlpha))
}

case class ContributorsListing() extends StandalonePage {
  override val metadata = MetaData.make(
    id = "index/contributors",
    section = Some(SectionSummary.fromId("Index")),
    webTitle = "contributors",
    customSignPosting = Some(IndexNav.contributorsAlpha))
}
