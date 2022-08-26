package model.dotcomrendering.pageElements

import common.{Edition, LinkTo}
import conf.Configuration.{affiliateLinks => affiliateLinksConfig}
import model.{Tag, Tags}
import org.jsoup.Jsoup
import views.support.AffiliateLinksCleaner

import scala.jdk.CollectionConverters._
import scala.util.matching.Regex

object TextCleaner {

  def affiliateLinks(pageUrl: String, addAffiliateLinks: Boolean)(html: String): String = {
    if (addAffiliateLinks) {
      val doc = Jsoup.parseBodyFragment(html)
      val links = AffiliateLinksCleaner.getAffiliateableLinks(doc)
      links.foreach(el => {
        val id = affiliateLinksConfig.skimlinksId
        el.attr("href", AffiliateLinksCleaner.linkToSkimLink(el.attr("href"), pageUrl, id))
      })

      if (links.nonEmpty) {
        doc.body().html()
      } else {
        html
      }
    } else {
      html
    }
  }

  def sanitiseLinks(edition: Edition)(html: String): String = {
    val doc = Jsoup.parseBodyFragment(html)
    val links = doc.body().getElementsByTag("a")

    links.asScala.foreach { link =>
      if (link.tagName == "a") {
        link.attr("href", LinkTo(link.attr("href"), edition))
      }
    }

    if (links.asScala.nonEmpty) {
      doc.body().html()
    } else {
      html
    }
  }

  def tagLinks(els: List[PageElement], tags: Tags, showInRelated: Boolean, edition: Edition): List[PageElement] = {
    var terms = Set[String]()

    els.map({
      case el: TextBlockElement =>
        val (updatedEl, updatedTerms) = TagLinker.addLink(tags, showInRelated, el, terms, edition)
        terms = updatedTerms
        updatedEl
      case other => other
    })
  }

  def split(html: String): List[(String, String)] = {
    Jsoup
      .parseBodyFragment(html)
      .body()
      .children()
      .asScala
      .toList
      .map(el => (el.tagName, el.outerHtml))
  }

}

object TagLinker {

  def link(tag: Tag, edition: Edition): String = {
    val href = LinkTo(tag.metadata.url, edition)

    s"""<a href="$href" data-component="auto-linked-tag">${tag.name}</a>"""
  }

  def keywordRegex(tagName: String): Regex = {
    // whitespace or start of line, then tag name, then whitespace, comma, end of line, full stop or question mark.
    s"""(?<start> |^)(?<tag>$tagName)(?<end>[ ,$$.?])""".r
  }

  def addLink(
      tags: Tags,
      showInRelated: Boolean,
      el: TextBlockElement,
      terms: Set[String],
      edition: Edition,
  ): (TextBlockElement, Set[String]) = {

    val containsLink = el.html.contains("<a")

    if (showInRelated && !containsLink) {
      val keywords =
        tags.keywords.filterNot(_.isSectionTag).sortBy(_.name.length).reverse.filterNot(tag => terms.contains(tag.name))
      val keyword = keywords.find(tag => el.html.contains(tag.name))

      keyword.map(tag => {
        val updatedHtml = keywordRegex(tag.name).replaceFirstIn(el.html, "${start}" + link(tag, edition) + "${end}")
        (TextBlockElement(updatedHtml), terms + tag.name)
      }) getOrElse (el, terms)
    } else {
      (el, terms)
    }
  }
}
