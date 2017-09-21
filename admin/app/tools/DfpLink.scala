package tools

import common.dfp.PageSkin
import conf.Configuration.commercial.dfpAccountId
import conf.Configuration.{commercial, site}

import scala.language.postfixOps

object DfpLink {

  def lineItem(lineItemId: Long): String = {
    s"https://www.google.com/dfp/$dfpAccountId#delivery/LineItemDetail/lineItemId=$lineItemId"
  }

  def creativeTemplate(templateId: Long): String = {
    s"https://www.google.com/dfp/$dfpAccountId#delivery/CreateCreativeTemplate/creativeTemplateId=$templateId"
  }

  def creative(creativeId: Long): String = {
    s"https://www.google.com/dfp/$dfpAccountId#delivery/CreativeDetail/creativeId=$creativeId"
  }

  def adUnit(adUnitId: String): String = {
    s"https://www.google.com/dfp/59666047?#inventory/inventory/adSlotId=$adUnitId"
  }
}

object SiteLink {

  def adUnit(path: String, adTest: Option[String]): Option[String] = {

    lazy val domain = if (adTest.isDefined) commercial.testDomain else site.host
    val relativePath = PageSkin.getRelativePath(path)
    val domainAndPath = relativePath map { path => s"$domain/$path" }
    val domainAndPathWithAdTest =
      for {
        id <- adTest
        baseUrl <- domainAndPath
      } yield s"$baseUrl?adtest=$id"

    domainAndPathWithAdTest orElse domainAndPath
  }

  def contributorTagPage(contributor: String): String = s"${site.host}/profile/$contributor"

  def page(pageId: String):String = s"${site.host}/$pageId"
}

object CapiLink {

  private def tagPage(tagType: String, tagName: String): String = s"http://content.guardianapis.com/tags?type=$tagType&q=$tagName"

  def keywordPage(keyword: String): String = tagPage("keyword", keyword)

  def seriesPage(series: String): String = tagPage("series", series)
}
