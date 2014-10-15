package model

object FrontKeywordId {

  def apply(sectionId: String): String = {
    val normalizedId = sectionId.replace("/", "-")
    s"$normalizedId/$normalizedId"
  }

}
