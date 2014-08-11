package model

class KeywordsListingMetaData extends MetaData {
  override def id: String = "index/keywords"

  override def section: String = "Index"

  override def analyticsName: String = "Keywords"

  override def webTitle: String = "keywords"

  override def customSignPosting = Some(IndexNav.keywordsAlpha)
}

class ContributorsListingMetaData extends MetaData {
  override def id: String = "index/contributors"

  override def section: String = "Index"

  override def analyticsName: String = "Contributors"

  override def webTitle: String = "contributors"

  override def customSignPosting = Some(IndexNav.contributorsAlpha)
}
