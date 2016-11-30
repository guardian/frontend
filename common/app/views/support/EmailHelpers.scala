package views.support

import conf.Static
import model._
import model.pressed.PressedContent
import play.twirl.api.Html

object EmailHelpers {
  def columnNumber(n: Int): String = {
    Seq("one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve").lift(n - 1).getOrElse("")
  }

  def row(inner: Html): Html = Html {
    s"""<table class="row">
          <tr>$inner</tr>
        </table>"""
  }

  def columns(n: Int, innerClasses: Seq[String] = Seq(), last: Boolean = false, style: Option[String] = None)(inner: Html): Html = Html {
    s"""<td class="wrapper ${if (last || n == 12) "last" else ""}" ${style.map(css => s"""style="$css"""").getOrElse("")}>
      <table class="${columnNumber(n)} columns">
        <tr>
          <td ${if (innerClasses.nonEmpty) s"""class="${innerClasses.mkString(" ")}" """ else ""}>$inner</td>
          <td class="expander"></td>
        </tr>
      </table>
    </td>"""
  }

  def fullRow(inner: Html): Html = row(columns(12)(inner))
  def fullRow(classes: Seq[String] = Seq.empty)(inner: Html): Html = row(columns(12, classes)(inner))
  def paddedRow(inner: Html): Html = row(columns(12, Seq("panel"))(inner))
  def paddedRow(classes: Seq[String] = Seq.empty)(inner: Html): Html = row(columns(12, classes ++ Seq("panel"))(inner))

  def imageUrlFromPressedContent(pressedContent: PressedContent): Option[String] = {
    for {
      InlineImage(imageMedia) <- InlineImage.fromFaciaContent(pressedContent)
      url <- FrontEmailImage.bestFor(imageMedia)
    } yield url
  }

  def subjectFromPage(page: Page): String = page match {
    case c: ContentPage => c.item.trail.headline
    case p: PressedPage => p.metadata.description.getOrElse(p.metadata.webTitle)
  }

  def introFromPage(page: Page): Option[String] = page match {
    case c: ContentPage => c.item.trail.byline
    case p: PressedPage => p.frontProperties.onPageDescription
  }

  def icon(name: String) = Html {
    s"""<img src="${Static(s"images/email/icons/$name.png")}" class="icon icon-$name">"""
  }

  def img(src: String, alt: Option[String] = None) = Html {
    s"""<img width="580" class="full-width" src="$src" ${alt.map(alt => s"""alt="$alt"""").getOrElse("")}>"""
  }

  def imgFromPressedContent(pressedContent: PressedContent) = imageUrlFromPressedContent(pressedContent).map { url =>
    img(src = url, alt = Some(pressedContent.header.headline))
  }

  object Images {
    val footerG = Static("images/email/grey-g.png")
    val quote = Static("images/email/quote.png")
    val play = Static("images/email/icons/play.png")
  }
}
