package model

case class SubjectsListing() extends Page {
  override val metadata = MetaData.make(
    id = "index/subjects",
    section = "Index",
    analyticsName = "Subjects",
    webTitle = "subjects",
    customSignPosting = Some(IndexNav.keywordsAlpha))
}

case class ContributorsListing() extends Page {
  override val metadata = MetaData.make(
    id = "index/contributors",
    section = "Index",
    analyticsName = "Contributors",
    webTitle = "contributors",
    customSignPosting = Some(IndexNav.contributorsAlpha))
}
