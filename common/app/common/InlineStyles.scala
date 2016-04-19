package common

import java.io.StringReader

import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import com.steadystate.css.parser.{SACParserCSS3, CSSOMParser}
import org.w3c.css.sac.InputSource
import org.w3c.dom.css.{CSSRule => W3CSSRule, CSSRuleList}
import play.twirl.api.Html

import scala.collection.JavaConversions._
import scala.collection.immutable.ListMap
import scala.util.Try

case class CSSRule(selector: String, styles: ListMap[String, String]) {
  val canInline = !selector.contains(":")

  // https://www.w3.org/TR/css3-selectors/#specificity
  val specifity: Int = {
    val ids = selector.count(_ == '#')
    val classes = selector.count(_ == '.')
    val attributes = selector.count(_ == '[')
    val pseudos = (":^\\s".r.findAllIn(selector)).length
    val tags = "(^|\\s)([+~]?\\w)".r.findAllIn(selector.replaceAll("\\[(.*)\\]", "[]")).length

    Seq(ids, (classes + attributes + pseudos), tags).map(_.toString).mkString.toInt
  }

  override def toString() = s"$selector { ${CSSRule.styleString(styles)} }"
}

object CSSRule {
  def fromW3(r: W3CSSRule): Option[Seq[CSSRule]] = {
    val rule = r.getCssText.split("\\{")

    for {
      selectors <- rule.lift(0)
      styles <- rule.lift(1)
    } yield {
      selectors.split(",").map(selector => CSSRule(selector.trim, makeStyles(styles.stripSuffix("}").trim)))
    }
  }

  def makeStyles(styles: String): ListMap[String, String] = {
    styles.split(";(?!base)").flatMap { style =>
      val split = style.split(":(?!(\\w)|(//))")

      for {
        property <- split.lift(0)
        value <- split.lift(1)
      } yield property.trim -> value.trim
    }.foldLeft(ListMap.empty[String, String])(_ + _)
  }

  def styleString(styles: ListMap[String, String]): String = styles.map { case (k, v) => s"$k: $v" }.mkString("; ")
}

object InlineStyles {
  val cssParser = new CSSOMParser(new SACParserCSS3())

  /**
    * Attempt to inline the rules from the <style> tags in a page.
    *
    * Each <style> tag is split into rules that can be inlined and those that can't (pseudo-selectors and
    * media queries).
    *
    * Everything that can be inlined gets added to the corresponding elements and whatever's left stays in the head.
    *
    * If any <style> tag can't be parsed, it'll be left in the head without modification.
    */
  def apply(html: Html): Html = {
    val document = Jsoup.parse(html.body)
    val (inline, head) = styles(document)

    document.getElementsByTag("head").headOption map { el =>
      el.getElementsByTag("style").map(_.remove)
      head.map(css => el.appendChild(document.createElement("style").text(css)))
    }

    inline sortBy(_.specifity) foreach { rule =>
      document.select(rule.selector) foreach(el => el.attr("style", mergeStyles(rule, el.attr("style"))))
    }

    Html(document.toString)
  }

  /**
    * Convert the styles in a document's <style> tags to a pair.
    * The first item is the styles that should stay in the head, the second is everything that should be inlined.
    */
  def styles(document: Document): (Seq[CSSRule], Seq[String]) = {
    document.getElementsByTag("style").foldLeft((Seq.empty[CSSRule], Seq.empty[String])) { case ((inline, head), element) =>
      val source = new InputSource(new StringReader(element.html))

      Try(cssParser.parseStyleSheet(source, null, null)).toOption map { sheet =>
        val (styles, others) = seq(sheet.getCssRules).partition(isStyleRule)
        val (inlineStyles, headStyles) = styles.flatMap(CSSRule.fromW3).flatten.partition(_.canInline)
        val newHead = (headStyles.map(_.toString) ++ others.map(_.getCssText)).mkString("\n")

        (inline ++ inlineStyles, (head :+ newHead).filter(_.nonEmpty))
      } getOrElse {
        (inline, head :+ element.html)
      }
    }
  }

  def mergeStyles(rule: CSSRule, existing: String): String = {
    CSSRule.styleString(rule.styles.foldLeft(CSSRule.makeStyles(existing)) { case (style, (property, value)) =>
      if (style.get(property).exists(_.contains("!important")) && !value.contains("!important")) style
      else style + (property -> value)
    })
  }

  private def seq(rules: CSSRuleList): Seq[W3CSSRule] = for (i <- 0 until rules.getLength) yield rules.item(i)
  private def isStyleRule(rule: W3CSSRule): Boolean = rule.getType == W3CSSRule.STYLE_RULE
}
