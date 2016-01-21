package common

import java.io.StringReader

import org.jsoup.Jsoup
import com.steadystate.css.parser.{SACParserCSS3, CSSOMParser}
import org.w3c.css.sac.InputSource
import org.w3c.dom.css.{CSSRule => W3CSSRule}
import play.twirl.api.Html

import scala.collection.JavaConversions._
import scala.util.Try

case class CSSRule(selector: Option[String], styles: Option[String])

object CSSRule {
  def apply(r: W3CSSRule): CSSRule = {
    val rule = r.getCssText.split("\\{")
    CSSRule(Try(rule(0).trim).toOption, Try(rule(1).stripSuffix("}").trim).toOption)
  }
}

object InlineStyles {
  val cssParser = new CSSOMParser(new SACParserCSS3())

  /**
    * Attempt to inline the rules from the <style> tag in a page.
    *
    * Take all of the selectors and use jsoup to add the styles to the corresponding elements. If it works,
    * the original <style> tag is removed.
    */
  def apply(html: Html): Html = {
    val document = Jsoup.parse(html.body)

    document.getElementsByTag("style").headOption flatMap { styleTag =>
      val sheet = new InputSource(new StringReader(styleTag.html))

      styleTag.remove

      Try(cssParser.parseStyleSheet(sheet, null, null)).toOption map { css =>
        val rules = css.getCssRules()
        val parsedRules = for (i <- 0 until rules.getLength) yield CSSRule(rules.item(i))

        parsedRules filter(_.selector.contains("@media")) // jsoup doesn't support media queries
          foreach { case CSSRule(Some(selector), Some(styles)) =>
            document.select(selector).attr("style", styles)
          }

        Html(document.toString)
      }
    } getOrElse(html)
  }
}
