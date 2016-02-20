package common

import java.io.StringReader

import org.jsoup.Jsoup
import com.steadystate.css.parser.{SACParserCSS3, CSSOMParser}
import org.w3c.css.sac.InputSource
import org.w3c.dom.css.{CSSRule => W3CSSRule}
import play.twirl.api.Html

import scala.collection.JavaConversions._
import scala.util.Try

case class CSSRule(selector: String, styles: String) {
  val jsoupCompatible: Boolean = !(selector.contains("@") || selector.contains(":"))
}

object CSSRule {
  def fromW3(r: W3CSSRule): Option[CSSRule] = {
    val rule = r.getCssText.split("\\{")

    for {
      selector <- Try(rule(0)).toOption
      styles   <- Try(rule(1)).toOption
    } yield CSSRule(selector.trim, styles.stripSuffix("}").trim)
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
        val parsedRules = for (i <- 0 until rules.getLength) yield CSSRule.fromW3(rules.item(i))

        parsedRules.flatten filter(_.jsoupCompatible) foreach { rule =>
          document.select(rule.selector) foreach { el =>
            val style = Seq(el.attr("style"), rule.styles) filter(_.nonEmpty) mkString("; ")
            el.attr("style", style)
          }
        }

        Html(document.toString)
      }
    } getOrElse(html)
  }
}
