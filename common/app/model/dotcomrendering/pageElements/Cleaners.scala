package model.dotcomrendering.pageElements

import common.Edition
import org.jsoup.Jsoup
import views.support.{AffiliateLinksCleaner, TagLinker}
import conf.Configuration.{affiliateLinks => affiliateLinksConfig}
import model.Tags

object Cleaners {

  def affiliateLinks(pageUrl: String)(el: TextBlockElement): TextBlockElement = {
    val doc = Jsoup.parseBodyFragment(el.html)
    val links = AffiliateLinksCleaner.getAffiliateableLinks(doc)
    links.foreach(el => {
      val id = affiliateLinksConfig.skimlinksId
      el.attr("href", AffiliateLinksCleaner.linkToSkimLink(el.attr("href"), pageUrl, id))
    })

    if (links.nonEmpty) {
      TextBlockElement(doc.body().html())
    } else {
      el
    }
  }

  def tagLinks(tags: Tags, showInRelated: Boolean, edition: Edition)(el: TextBlockElement): TextBlockElement = {
    val cleaner = TagLinker(tags, showInRelated)(edition)
    val doc = Jsoup.parseBodyFragment(el.html)
    val withLinks = cleaner.clean(doc)
    TextBlockElement(withLinks.body().html())
  }
}
