package html

import org.jsoup.Jsoup
import org.jsoup.nodes.{Node, TextNode}
import play.twirl.api.Html

import scala.jdk.CollectionConverters._

object HtmlTextExtractor {

  private val newLineNodeNames = Set("br", "dd", "dt", "p", "h1", "h2", "h3", "h4", "h5", "tr")

  def apply(html: Html): String = {
    val documentBody = Jsoup.parseBodyFragment(html.toString).body()
    documentBody.setBaseUri("https://www.theguardian.com")

    val text = filterImagesAndFlattenNodes(documentBody).collect {
      case node if node.nodeName() == "a"                       => node.absUrl("href").trim() + "\n"
      case node: TextNode if node.parent().nodeName() == "span" => node.text().trim + " "
      case node: TextNode if node.text().trim.nonEmpty          => node.text().trim + "\n"
      case node if newLineNodeNames.contains(node.nodeName())   => "\n"
    }.mkString

    removeWhitespace(text)

  }

  private def filterImagesAndFlattenNodes(node: Node): Seq[Node] = {
    val children = node.childNodes.asScala
    // only filter the large full width images since they contain duplicated links
    if (children.exists(child => child.nodeName() == "img" && child.attr("class") == "full-width"))
      Nil
    else
      node +: children.flatMap(filterImagesAndFlattenNodes).toSeq
  }

  private def removeWhitespace(text: String): String = {
    val withoutTripleNewline = "\n\\s*\n\\s*\n\\s*\n".r.replaceAllIn(text, "\n\n\n")
    val withoutSpacing = "(?m)^[ \\t\\x0B\\f\\r\\u00a0]+$".r.replaceAllIn(withoutTripleNewline, "")
    if (withoutSpacing == text) withoutSpacing else removeWhitespace(withoutSpacing)
  }

}
