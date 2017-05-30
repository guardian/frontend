package components.core

import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.jsoup.parser.Parser
import play.twirl.api.Html
import scala.collection.JavaConversions._

trait HtmlComponent {

  def html: Html
  def componentCss: Seq[Css]

  def render(): Html = {
    val document: Document = Jsoup.parse(html.toString, "", Parser.xmlParser()) //Provide an XML Parser so Jsoup doesn't automatically add <html>, <head> and <body> tags

    // Adding inlined css if component has a head tag
    document.getElementsByTag("head").headOption.map { el =>

      val cssAsString = css.reduce(_ :+ _).asString

      el.getElementsByTag("style").map(_.remove)
      el.appendChild(document.createElement("style").text(cssAsString))
    }

    Html(document.html)
  }

  def css: Seq[Css] = (componentCss ++ children.flatMap(_.css)).distinct

  lazy val children: Seq[HtmlComponent] = this
    .getClass
    .getDeclaredFields
    .flatMap { field =>
      field.setAccessible(true)
      field.get(this) match {
        case h: HtmlComponent => Some(h)
        case _ => None
      }
    }
    .filterNot(_ == this)
    .toSeq
}

object HtmlComponent {
  import scala.language.implicitConversions
  implicit def raw(c: HtmlComponent): String = c.html.toString
}
