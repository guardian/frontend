package views.support.cleaner

import org.scalatest.matchers.should.Matchers
import StringCleaner._
import org.scalatest.flatspec.AnyFlatSpec

class StyleCleanerTest extends AnyFlatSpec with Matchers {

  def ignoreWhiteSpaces(s: String): String = s.replaceAll("\\s", "")

  lazy val styleCleaner = AttributeCleaner("style")

  it should "remove inline style attribute" in {
    val html: String = <html>
      <head></head>
      <body>
        <h1 style="text-align:center">title</h1>
          <p style="color:black">paragraph</p>
        </body>
      </html>.toString()

    val cleanedStyles = html.cleanWith(styleCleaner).getElementsByAttribute("style")
    cleanedStyles.size should be(0)
  }

  it should "do nothing if no style attribute" in {
    val originalHtml: String = <html>
      <head></head>
      <body>
        <h1>title</h1>
        <p>paragraph</p>
      </body>
    </html>.toString()

    val cleanedHtml = originalHtml.cleanWith(styleCleaner)
    ignoreWhiteSpaces(cleanedHtml.html()) should be(ignoreWhiteSpaces(originalHtml))
  }

}
