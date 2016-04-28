package tools

import conf.Configuration.commercial.dfpAccountId
import conf.Configuration.{site, commercial}
import scala.language.postfixOps

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

  def adUnit(path: String, adTest: Option[String]): String = {

    def getRelativePath(dropFromRight: Int) = path.split("/").drop(1).dropRight(dropFromRight).mkString("/")

    lazy val domain = if (adTest.isDefined) commercial.testDomain else site.host

    val relativePath =
      if (path endsWith "/front/ng")
        getRelativePath(2)
      else if (path endsWith "front")
        getRelativePath(1)
      else
        getRelativePath(0)

    val domainAndPath = s"${domain}/${relativePath}"

    adTest match {
      case Some(id) => s"${domainAndPath}?adtest=${id}"
      case _ => domainAndPath
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
