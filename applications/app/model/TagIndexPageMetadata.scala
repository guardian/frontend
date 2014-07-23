package model

class TagIndexPageMetaData(val tagType: String, val page: Char) extends MetaData {
  override def id: String = s"/index/${tagType}s/$page"

  override def section: String = tagType + "s"

  /** TODO figure out what ought to go here */
  override def analyticsName: String = id

  override def webTitle: String = page.toUpper.toString
}
