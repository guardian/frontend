package common

import java.io.StringReader

import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import com.steadystate.css.parser.{CSSOMParser, SACParserCSS3}
import org.w3c.css.sac.InputSource
import org.w3c.dom.css.{CSSRuleList, CSSRule => W3CSSRule}
import play.twirl.api.Html

import scala.collection.JavaConverters._
import scala.collection.immutable.ListMap
import scala.util.{Failure, Success}

case class CSSRule(selector: String, styles: ListMap[String, String]) {
  val canInline = !selector.contains(":")

  // https://www.w3.org/TR/css3-selectors/#specificity
  val specifity: Int = {
    val ids = selector.count(_ == '#')
    val classes = selector.count(_ == '.')
    val attributes = selector.count(_ == '[')
    val pseudos = ":^\\s".r.findAllIn(selector).length
    val tags = "(^|\\s)([+~]?\\w)".r.findAllIn(selector.replaceAll("\\[(.*)\\]", "[]")).length

    Seq(ids, classes + attributes + pseudos, tags).map(_.toString).mkString.toInt
  }

  override def toString(): String = s"$selector { ${CSSRule.styleStringFromMap(styles)} }"
}

object CSSRule {
  def fromW3(r: W3CSSRule): Option[Seq[CSSRule]] = {
    val rule = r.getCssText.split("\\{")

    for {
      selectors <- rule.headOption
      styles <- rule.lift(1)
    } yield {
      selectors
        .split(",")
        .map(selector => CSSRule(selector.trim, styleMapFromString(styles.stripSuffix("}").trim)))
        .toIndexedSeq
    }
  }

  def styleMapFromString(styles: String): ListMap[String, String] = {
    styles
      .split(";(?!base)")
      .flatMap { style =>
        val split = style.split(":(?!(\\w)|(//))")

        for {
          property <- split.headOption
          value <- split.lift(1)
        } yield property.trim -> value.trim
      }
      .foldLeft(ListMap.empty[String, String])(_ + _)
  }

  def styleStringFromMap(styles: ListMap[String, String]): String =
    styles.map { case (k, v) => s"$k: $v" }.mkString("; ")
}

object InlineStyles extends GuLogging {

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

    document.getElementsByTag("head").asScala.headOption map { el =>
      el.getElementsByTag("style").asScala.foreach(_.remove)
      head.map(css => el.appendChild(document.createElement("style").text(css)))
    }

    inline.sortBy(_.specifity).foreach { rule =>
      document.select(rule.selector).asScala.foreach(el => el.attr("style", mergeStyles(rule, el.attr("style"))))
    }

    // Outlook ignores styles with !important so we need to strip that out.
    // So this doesn't change which styles take effect, we also sort styles
    // so that all important styles appear to the right of all non-important styles.
    document.getAllElements.asScala.filter(el => el.attr("style") != "").foreach { el =>
      el.attr("style", sortStyles(el.attr("style")).replace(" !important", ""))
    }

    Html(document.toString)
  }

  /**
    * Convert the styles in a document's <style> tags to a pair.
    * The first item is the styles that should stay in the head, the second is everything that should be inlined.
    */
  def styles(document: Document): (Seq[CSSRule], Seq[String]) = {
    document.getElementsByTag("style").asScala.foldLeft((Seq.empty[CSSRule], Seq.empty[String])) {
      case ((inline, head), element) =>
        val source = new InputSource(new StringReader(element.html))
        val cssParser = new CSSOMParser(new SACParserCSS3())
        Retry(3)(cssParser.parseStyleSheet(source, null, null)) { (exception, attemptNumber) =>
          log.error(s"Attempt $attemptNumber to parse stylesheet failed", exception)
        } match {
          case Failure(_) => (inline, head :+ element.html)
          case Success(sheet) =>
            val (styles, others) = seq(sheet.getCssRules).partition(isStyleRule)
            val (inlineStyles, headStyles) = styles.flatMap(CSSRule.fromW3).flatten.partition(_.canInline)
            val newHead = (headStyles.map(_.toString) ++ others.map(_.getCssText)).mkString("\n")
            (inline ++ inlineStyles, (head :+ newHead).filter(_.nonEmpty))
        }
    }
  }

  /**
    * I found drawing this table helpful in understanding the logic of this function.
    * As you add styles from left to right:
    *
    * Existing Style | New Style    | Which should win?
    * ---------------------------------------------------
    *  !important    |      -       | existing
    *      -         |  !important  | new
    *  !important    |  !important  | new
    *      -         |      -       | new
    */
  def mergeStyles(rule: CSSRule, existing: String): String = {
    CSSRule.styleStringFromMap(rule.styles.foldLeft(CSSRule.styleMapFromString(existing)) {
      case (style, (property, value)) =>
        if (style.get(property).exists(_.contains("!important")) && !value.contains("!important")) style
        else style + (property -> value)
    })
  }

  /**
    * Ensure !important styles appear last
    */
  def sortStyles(styles: String): String = {
    val stylesMap = CSSRule.styleMapFromString(styles)
    val importantStylesLast = ListMap(stylesMap.toSeq.sortWith {
      case ((_, v1), (_, v2)) =>
        if (v1.contains("!important") || !v2.contains("!important")) false
        else true
    }: _*)

    CSSRule.styleStringFromMap(importantStylesLast)
  }

  private def seq(rules: CSSRuleList): Seq[W3CSSRule] = for (i <- 0 until rules.getLength) yield rules.item(i)
  private def isStyleRule(rule: W3CSSRule): Boolean = rule.getType == W3CSSRule.STYLE_RULE
}
