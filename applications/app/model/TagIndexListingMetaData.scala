package model

class SubjectsListingMetaData extends MetaData {
  override def id: String = "index/subjects"

  override def section: String = "Index"

  override def analyticsName: String = "Subjects"

  override def webTitle: String = "subjects"

  override def customSignPosting = Some(IndexNav.keywordsAlpha)
}

class ContributorsListingMetaData extends MetaData {
  override def id: String = "index/contributors"

  override def section: String = "Index"

  override def analyticsName: String = "Contributors"

  override def webTitle: String = "contributors"

  override def customSignPosting = Some(IndexNav.contributorsAlpha)
}
