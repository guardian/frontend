package views.support

import conf.Static
import layout.ContentCard
import model._
import play.twirl.api.Html
import play.api.mvc._

object EmailHelpers {
  def columnWidth(width: Int): String = {
    Seq("one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve").lift(width - 1).getOrElse("")
  }

  def row(inner: Html): Html = Html {
    s"""<table class="row">
          <tr>$inner</tr>
        </table>"""
  }

  def column(width: Int, innerClasses: Seq[String] = Seq(), last: Boolean = false, style: Option[String] = None)(inner: Html): Html = Html {
    s"""<td class="wrapper ${if (last || width == 12) "last" else ""}" ${style.map(css => s"""style="$css"""").getOrElse("")}>
      <table class="${columnWidth(width)} columns">
        <tr>
          <td ${if (innerClasses.nonEmpty) s"""class="${innerClasses.mkString(" ")}" """ else ""}>$inner</td>
          <td class="expander"></td>
        </tr>
      </table>
    </td>"""
  }

  def columnWithSubColumns(width: Int, innerClasses: Seq[String] = Seq(), last: Boolean = false, style: Option[String] = None)(inner: Html): Html = Html {
    s"""<td class="wrapper ${if (last || width == 12) "last" else ""}" ${style.map(css => s"""style="$css"""").getOrElse("")}>
      <table class="${columnWidth(width)} columns">
        <tr>
          $inner
          <td class="expander"></td>
        </tr>
      </table>
    </td>"""
  }

  def subColumn(width: Int, classes: Seq[String] = Seq(), last: Boolean = false)(inner: Html): Html = Html {
    s"""<td class="${columnWidth(width)} sub-columns ${if (last || width == 12) "last" else ""} ${classes.mkString(" ")}">$inner</td>"""
  }

  def fullRow(inner: Html): Html = row(column(12)(inner))
  def fullRow(classes: Seq[String] = Seq.empty)(inner: Html): Html = row(column(12, classes)(inner))
  def fullRowWithSubColumns(classes: Seq[String] = Seq.empty)(inner: Html): Html = row(columnWithSubColumns(12, classes)(inner))
  def paddedRow(inner: Html): Html = row(column(12, Seq("panel"))(inner))
  def paddedRow(classes: Seq[String] = Seq.empty)(inner: Html): Html = row(column(12, classes ++ Seq("panel"))(inner))

  def imageUrlFromCard(contentCard: ContentCard): Option[String] = {
    for {
      InlineImage(imageMedia) <- contentCard.displayElement
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

  private def img(width: Int)(src: String, alt: Option[String] = None) = Html {
    s"""<img width="$width" class="full-width" src="$src" ${alt.map(alt => s"""alt="$alt"""").getOrElse("")}>"""
  }

  def imgForArticle = img(EmailImage.knownWidth) _

  def imgForFront = img(FrontEmailImage.knownWidth) _

  def imgFromCard(card: ContentCard)(implicit requestHeader: RequestHeader) = imageUrlFromCard(card).map { url => Html {
      s"""<a class="facia-link" ${card.header.url.hrefWithRel}>${imgForFront(url, Some(card.header.headline))}</a>"""
    }
  }

  object Images {
    val footerG = Static("images/email/grey-g.png")
    val quote = Static("images/email/quote.png")
    val play = Static("images/email/icons/play.png")
  }
}
