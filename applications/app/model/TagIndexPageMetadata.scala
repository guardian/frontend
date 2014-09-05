package model

trait TagIndexPageMetaData extends MetaData {
  val page: String

  val tagType: String

  val indexFolder: String

  override def id: String = s"index/$indexFolder/$page"

  override def section: String = tagType

  override def analyticsName: String = tagType

  override def webTitle: String = page.capitalize
}

class SubjectIndexPageMetaData(val page: String) extends TagIndexPageMetaData {
  override val tagType: String = "keywords"

  override val indexFolder: String = "subjects"

  override def customSignPosting = Some(IndexNav.keywordsAlpha)
}

class ContributorsIndexPageMetaData(val page: String) extends TagIndexPageMetaData {
  override val tagType: String = "contributors"

  override val indexFolder: String = "contributors"

  override def customSignPosting = Some(IndexNav.contributorsAlpha)
}
