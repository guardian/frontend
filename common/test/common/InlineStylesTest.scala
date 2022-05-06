package common

import org.jsoup.Jsoup
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.twirl.api.Html

import scala.collection.immutable.ListMap

class InlineStylesTest extends AnyFlatSpec with Matchers {
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
        |</html>""".stripMargin,
    )

    val (toInline, head) = InlineStyles.styles(document)

    toInline should be(
      Seq(
        CSSRule("h1", ListMap("color" -> "red")),
        CSSRule("h2", ListMap("color" -> "blue !important", "border" -> "10px dashed aquamarine")),
        CSSRule("h1", ListMap("color" -> "green", "border" -> "1px solid black")),
        CSSRule("h2", ListMap("color" -> "yellow", "border" -> "1px solid orange")),
      ),
    )

    head should be(Seq("a:hover { color: blue }"))
  }

  it should "merge styles correctly" in {
    val toAdd = CSSRule("h2", ListMap("color" -> "blue", "border" -> "10px dashed aquamarine"))
    val existing = "color: red !important; border: 5px dashed yellow"
    val toAdd2 = CSSRule("td", ListMap("padding-right" -> "0px"))
    val existing2 =
      "margin: 0; hyphens: none; vertical-align: top; color: rgb(34, 34, 34); font-family: Helvetica, Arial, sans-serif; line-height: 19px; -moz-hyphens: none; position: relative; padding: 10px 20px 0px 0px; text-align: left; word-break: break-word; border-collapse: collapse !important; font-weight: normal; -webkit-hyphens: none; font-size: 14px"

    InlineStyles.mergeStyles(toAdd, existing) should be("color: red !important; border: 10px dashed aquamarine")
    InlineStyles.mergeStyles(toAdd2, existing2) should be(
      "margin: 0; hyphens: none; vertical-align: top; color: rgb(34, 34, 34); font-family: Helvetica, Arial, sans-serif; line-height: 19px; -moz-hyphens: none; position: relative; padding: 10px 20px 0px 0px; text-align: left; word-break: break-word; border-collapse: collapse !important; font-weight: normal; -webkit-hyphens: none; font-size: 14px; padding-right: 0px",
    )
  }

  it should "preserve properties with base64 strings" in {
    val styles = "font-family: Arial; background: red url(data:image/png;base64,ABCDEF)"

    CSSRule.styleMapFromString(styles) should be(
      ListMap("font-family" -> "Arial", "background" -> "red url(data:image/png;base64,ABCDEF)"),
    )
  }

  it should "work with urls in values" in {
    val http = "background: url(http://www.example.com/image.png)"
    val https = "background: url(https://www.example.com/image.png)"
    val relative = "background: url(//www.example.com/image.png)"

    CSSRule.styleMapFromString(http) should be(ListMap("background" -> "url(http://www.example.com/image.png)"))
    CSSRule.styleMapFromString(https) should be(ListMap("background" -> "url(https://www.example.com/image.png)"))
    CSSRule.styleMapFromString(relative) should be(ListMap("background" -> "url(//www.example.com/image.png)"))
  }

  it should "make !important styles appear last while otherwise preserving the existing ordering" in {
    val styleString = "padding-top: 10px !important; color: red; margin: 5px !important; padding: 5px;"

    InlineStyles.sortStyles(styleString) should be(
      "color: red; padding: 5px; padding-top: 10px !important; margin: 5px !important",
    )
  }

  it should "inline styles correctly" in {
    val html = """
                 |<html>
                 |<head>
                 |<style>
                 |#h1 { color: red !important; border: 1px; padding: 0; }
                 |</style>
                 |<style>
                 |h1 { padding: 1px !important; margin: 0; border: 0; }
                 |</style>
                 |<style>
                 |h1 { margin: 1px; }
                 |</style>
                 |</head>
                 |<body>
                 |<h1 id="h1">Hello</h1>
                 |</body>
                 |</html>""".stripMargin

    val inlinedHtml = InlineStyles(Html(html))
    val inlinedDocument = Jsoup.parse(inlinedHtml.toString)

    // specificity puts #h1 styles to the right of h1 styles, so expect "border: 1px" to beat "border: 0"
    // precedence puts the second h1 to the right of the first, so expect "margin: 1px" to beat "margin: 0"
    // !important overrides specificity & precedence so expect "padding: 1px" to beat "padding: 0"
    // !important styles should end up on the right so expect "padding: 1px" and "color: red" to be on the right

    inlinedDocument.getElementById("h1").attr("style") should be("margin: 1px; border: 1px; padding: 1px; color: red")
  }
}
