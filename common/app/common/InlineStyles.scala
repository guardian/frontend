package common

import java.io.StringReader

import org.jsoup.Jsoup
import com.steadystate.css.parser.{SACParserCSS3, CSSOMParser}
import org.w3c.css.sac.InputSource
import org.w3c.dom.css.{CSSRule => W3CSSRule, CSSRuleList}
import play.twirl.api.Html

import scala.collection.JavaConversions._
import scala.util.Try

case class CSSRule(selector: String, styles: String) {
  val canInline = !selector.contains(":")

  // https://www.w3.org/TR/css3-selectors/#specificity
  lazy val specifity: Int = {
    val ids = selector.count(_ == '#')
    val classes = selector.count(_ == '.')
    val attributes = selector.count(_ == '[')
    val pseudos = (":^\\s".r.findAllIn(selector)).length
    val tags = "(^|\\s)([+~]?\\w)".r.findAllIn(selector.replaceAll("\\[(.*)\\]", "[]")).length

    Seq(ids, (classes + attributes + pseudos), tags).map(_.toString).mkString.toInt
  }

  override def toString() = s"$selector { $styles; }"
}

object CSSRule {
  def fromW3(r: W3CSSRule): Option[Seq[CSSRule]] = {
    val rule = r.getCssText.split("\\{")

    for {
      selectors <- Try(rule(0)).toOption
      styles <- Try(rule(1)).toOption
    } yield {
      selectors.split(",").map(selector => CSSRule(selector.trim, styles.stripSuffix("}").trim))
    }
  }
}

object InlineStyles {
  val cssParser = new CSSOMParser(new SACParserCSS3())

  /**
    * Attempt to inline the rules from the <style> tags in a page.
    *
    * First, combine each style tag, inline everything that can be inlined, and then create a new style tag with
    * whatever's left (which should be pseudo-selectors and media queries).
    *
    * If everything works, you'll get the document with the inlined styles and the updated <style> tag. Otherwise
    * you'll get the original document, untouched.
    */
  def apply(html: Html): Html = {
    val document = Jsoup.parse(html.body).clone()

    val rules = document.getElementsByTag("style").foldLeft(Set.empty[String])(_ + _.html)
    val source = new InputSource(new StringReader(rules.mkString("\n")))

    Try(cssParser.parseStyleSheet(source, null, null)).toOption map { sheet =>
      val (mediaQueries, styles) = seq(sheet.getCssRules).partition(isMediaQuery)
      val (inline, head) = styles.flatMap(CSSRule.fromW3).flatten.partition(_.canInline)

      document.getElementsByTag("head").headOption map { el =>
        el.getElementsByTag("style").remove()
        el.appendChild(document.createElement("style").text {
          (head.map(_.toString) ++ mediaQueries.map(_.getCssText)).mkString("\n")
        })
      }

      inline sortBy(_.specifity) foreach { rule =>
        document.select(rule.selector) foreach { el =>
          val style = Seq(el.attr("style"), rule.styles) filter (_.nonEmpty) mkString ("; ")
          el.attr("style", style)
        }
      }

      Html(document.toString)
    } getOrElse html
  }

  private def seq(rules: CSSRuleList): Seq[W3CSSRule] = for (i <- 0 until rules.getLength) yield rules.item(i)
  private def isMediaQuery(rule: W3CSSRule): Boolean = rule.getType == W3CSSRule.MEDIA_RULE
}
