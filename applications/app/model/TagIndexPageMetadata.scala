package model

object SubjectIndexPageMetaData {
  private val tagType: String = "keywords"
  private val indexFolder: String = "subjects"
  private val signPosting = Some(IndexNav.keywordsAlpha)

  def make(page: String): MetaData = MetaData.make(
    id = s"index/$indexFolder/$page",
    section = tagType,
    analyticsName = tagType,
    webTitle = page.capitalize,
    customSignPosting = signPosting)
}

object ContributorsIndexPageMetaData {
  private val tagType: String = "contributors"
  private val indexFolder: String = "contributors"
  private val signPosting = Some(IndexNav.contributorsAlpha)

  def make(page: String): MetaData = MetaData.make(
    id = s"index/$indexFolder/$page",
    section = tagType,
    analyticsName = tagType,
    webTitle = page.capitalize,
    customSignPosting = signPosting)
}
