package model

case class SubjectsListing(listings: TagIndexListings) extends StandalonePage {
  override val metadata = MetaData.make(
    id = "index/subjects",
    section = Some(SectionId.fromId("Index")),
    webTitle = "subjects",
    customSignPosting = Some(IndexNav.keywordsAlpha),
  )
}

case class ContributorsListing(listings: TagIndexListings) extends StandalonePage {
  override val metadata = MetaData.make(
    id = "index/contributors",
    section = Some(SectionId.fromId("Index")),
    webTitle = "contributors",
    customSignPosting = Some(IndexNav.contributorsAlpha),
  )
}
