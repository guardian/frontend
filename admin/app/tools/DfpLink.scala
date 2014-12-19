package tools

import conf.Configuration.commercial.dfpAccountId
import conf.Configuration.site

object DfpLink {

  def lineItem(lineItemId: Long) = {
    s"https://www.google.com/dfp/$dfpAccountId#delivery/LineItemDetail/lineItemId=$lineItemId"
  }

  def creativeTemplate(templateId: Long) = {
    s"https://www.google.com/dfp/$dfpAccountId#delivery/CreateCreativeTemplate/creativeTemplateId=$templateId"
  }

  def creative(creativeId: Long) = {
    s"https://www.google.com/dfp/$dfpAccountId#delivery/CreativeDetail/creativeId=$creativeId"
  }

  def adUnit(adUnitId: String) = {
    s"https://www.google.com/dfp/59666047?#inventory/inventory/adSlotId=$adUnitId"
  }
}

object SiteLink {

  def adUnit(path: String): Option[String] = {

    def getRelativePath(dropFromRight: Int) = path.split("/").drop(1).dropRight(dropFromRight).mkString("/")

    lazy val relativePath = getRelativePath(1)
    lazy val relativeEditionalisedPath = getRelativePath(2)

    if (path endsWith "/front") {
      Some(s"${site.host}/${relativePath}")
    } else if (path endsWith "/front/ng") {
      Some(s"${site.host}/${relativeEditionalisedPath}?view=mobile")
    } else if (path endsWith "/front/r2") {
      Some(s"${site.host}/${relativeEditionalisedPath}?view=classic")
    } else {
      None
    }
  }

  def contributorTagPage(contributor: String): String = s"${site.host}/profile/$contributor"

  def page(pageId: String):String = s"${site.host}/$pageId"
}

object CapiLink {

  private def tagPage(tagType: String, tagName: String): String = s"http://content.guardianapis.com/tags?type=$tagType&q=$tagName"

  def keywordPage(keyword: String): String = tagPage("keyword", keyword)

  def seriesPage(series: String): String = tagPage("series", series)
}
