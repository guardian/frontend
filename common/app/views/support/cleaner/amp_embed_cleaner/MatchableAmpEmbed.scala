package views.support.cleaner.amp_embed_cleaner

import org.jsoup.nodes.Element

import scala.util.matching.Regex

/**
* Created by mmcnamara on 18/04/2017.
*/
abstract class MatchableAmpEmbed(urlLocationTag: String, urlTagId: String) extends AmpEmbed {
  val matchingUrl: String = getMatchingUrl()
  val urlPattern: Regex
  def isAMatch: Boolean = urlPattern.findFirstIn(matchingUrl).isDefined
  def getMatchingUrl(): String
  def getAttrib(element: Element, name: String): String = {
    element.attr(name)

  }
}
