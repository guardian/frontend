package commercial.model.capi

object Keyword {

  def getIdSuffix(keywordId: String): String = keywordId.split('/').last

  def idSuffixesIntersect(suffixes1: Seq[String], suffixes2: Seq[String]): Boolean = {
    suffixes1.intersect(suffixes2).nonEmpty
  }
}
