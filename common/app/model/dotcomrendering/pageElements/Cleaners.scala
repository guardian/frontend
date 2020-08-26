package model.dotcomrendering.pageElements

import common.{Edition, LinkTo}
import conf.Configuration.{affiliateLinks => affiliateLinksConfig}
import model.{Tag, Tags}
import org.jsoup.Jsoup
import views.support.AffiliateLinksCleaner

import scala.util.matching.Regex
import scala.util.matching.Regex.Match

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
}

object TagLinker {

  def link(tag: Tag, edition: Edition): String = {
    val href = LinkTo(tag.metadata.url, edition)

    s"""<a href=$href data-component="auto-linked-tag">${tag.name}</a>"""
  }

  def keywordRegex(tagName: String): Regex = {
    // whitespace or start of line, then tag name, then whitespace, comma, end of line, full stop or question mark.
    s"""( |^)($tagName)([ ,$$.?])""".r("start", "tag", "end")
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
        tags.keywords.filterNot(_.isSectionTag).sortBy(_.name.length).filterNot(tag => terms.contains(tag.name))
      val keyword = keywords.find(tag => el.html.contains(tag.name))

      keyword.map(tag => {
        def mapper(tag: Tag)(m: Match) = Some(m.group("start") + link(tag, edition) + m.group("end"))
        val updatedHtml = keywordRegex(tag.name).replaceSomeIn(el.html, mapper(tag))
        (TextBlockElement(updatedHtml), terms + tag.name)
      }) getOrElse (el, terms)
    } else {
      (el, terms)
    }
  }
}
