package tools

import conf.Configuration.commercial.dfpAccountId
import conf.Configuration.site

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

  def contributorTagPage(contributor: String): String = s"${site.host}/profile/$contributor"

  def page(pageId: String): String = s"${site.host}/$pageId"
}

object CapiLink {

  private def tagPage(tagType: String, tagName: String): String =
    s"https://content.guardianapis.com/tags?type=$tagType&q=$tagName"

  def keywordPage(keyword: String): String = tagPage("keyword", keyword)

  def seriesPage(series: String): String = tagPage("series", series)

  def sectionPage(section: String): String = tagPage("section", section)

  def tonePage(tone: String): String = tagPage("tone", tone)
}
