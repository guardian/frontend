package common

import org.jsoup.Jsoup
import org.scalatest.{FlatSpec, Matchers}
import scala.collection.immutable.ListMap

class InlineStylesTest extends FlatSpec with Matchers {
  val stub: ListMap[String, String] = ListMap.empty

  // https://www.w3.org/TR/css3-selectors/#specificity
  it should "calculate specifity" in {
    CSSRule("*", stub).specifity should be(0)
    CSSRule("LI", stub).specifity should be(1)
    CSSRule("UL LI", stub).specifity should be(2)
    CSSRule("UL OL +LI", stub).specifity should be(3)
    CSSRule("H1 + *[REL = up]", stub).specifity should be(11)
    CSSRule("UL OL LI.red", stub).specifity should be(13)
    CSSRule("LI.red.level", stub).specifity should be(21)
    CSSRule("#x34y", stub).specifity should be(100)
    CSSRule("#s12: not (FOO)", stub).specifity should be(101)
  }

  it should "parse the correct styles" in {
    val document = Jsoup.parse(
      """
        |<html>
        |<head>
        |<style>
        |h1 { color: red; }
        |h2 { color: blue !important; border: 10px dashed aquamarine; }
        |</style>
        |<style>
        |h1 { color: green; border: 1px solid black; }
        |h2 { color: yellow; border: 1px solid orange; }
        |a:hover { color: blue; }
        |</style>
        |</head>
        |<body>
        |<h1>Hello</h1>
        |<h2>Goodbye</h2>
        |</body>
        |</html>""".stripMargin
    )

    val (toInline, head) = InlineStyles.styles(document)

    toInline should be(Seq(
      CSSRule("h1", ListMap("color" -> "red")),
      CSSRule("h2", ListMap("color" -> "blue !important", "border" -> "10px dashed aquamarine")),
      CSSRule("h1", ListMap("color" -> "green", "border" -> "1px solid black")),
      CSSRule("h2", ListMap("color" -> "yellow", "border" -> "1px solid orange"))
    ))

    head should be(Seq("a:hover { color: blue }"))
  }

  it should "merge styles correctly" in {
    val toAdd = CSSRule("h2", ListMap("color" -> "blue", "border" -> "10px dashed aquamarine"))
    val existing = "color: red !important; border: 5px dashed yellow"
    val toAdd2 = CSSRule("td", ListMap("padding-right" -> "0px"))
    val existing2 = "margin: 0; hyphens: none; vertical-align: top; color: rgb(34, 34, 34); font-family: Helvetica, Arial, sans-serif; line-height: 19px; -moz-hyphens: none; position: relative; padding: 10px 20px 0px 0px; text-align: left; word-break: break-word; border-collapse: collapse !important; font-weight: normal; -webkit-hyphens: none; font-size: 14px"

    InlineStyles.mergeStyles(toAdd, existing) should be("color: red !important; border: 10px dashed aquamarine")
    InlineStyles.mergeStyles(toAdd2, existing2) should be("margin: 0; hyphens: none; vertical-align: top; color: rgb(34, 34, 34); font-family: Helvetica, Arial, sans-serif; line-height: 19px; -moz-hyphens: none; position: relative; padding: 10px 20px 0px 0px; text-align: left; word-break: break-word; border-collapse: collapse !important; font-weight: normal; -webkit-hyphens: none; font-size: 14px; padding-right: 0px")
  }

  it should "preserve properties with base64 strings" in {
    val styles = "font-family: Arial; background: red url(data:image/png;base64,ABCDEF)"

    CSSRule.makeStyles(styles) should be(ListMap("font-family" -> "Arial", "background" -> "red url(data:image/png;base64,ABCDEF)"))
  }

  it should "work with urls in values" in {
    val http = "background: url(http://www.example.com/image.png)"
    val https = "background: url(https://www.example.com/image.png)"
    val relative = "background: url(//www.example.com/image.png)"

    CSSRule.makeStyles(http) should be(ListMap("background" -> "url(http://www.example.com/image.png)"))
    CSSRule.makeStyles(https) should be(ListMap("background" -> "url(https://www.example.com/image.png)"))
    CSSRule.makeStyles(relative) should be(ListMap("background" -> "url(//www.example.com/image.png)"))
  }
}
