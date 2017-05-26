package views.support

import conf.Static
import layout.ContentCard
import model._
import play.twirl.api.Html
import play.api.mvc._

object EmailHelpers {
  def imageUrlFromCard(contentCard: ContentCard, width: Int): Option[String] = {
    for {
      InlineImage(imageMedia) <- contentCard.displayElement
      url <- SmallFrontEmailImage(width).bestFor(imageMedia)
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

  def icon(name: String, largeHeadline: Boolean = false) = Html {
    val height = if(largeHeadline) 18 else 12
    s"""<img height="$height" src="${Static(s"images/email/icons/$name.png")}" class="icon icon-$name">"""
  }

  private def img(width: Int)(src: String, alt: Option[String] = None) = Html {
    s"""<img width="$width" class="full-width" src="$src" ${alt.map(alt => s"""alt="$alt"""").getOrElse("")}>"""
  }

  def imgForArticle: (String, Option[String]) => Html = img(EmailImage.knownWidth) _

  def imgForFront: (String, Option[String]) => Html = img(FrontEmailImage.knownWidth) _

  def imgFromCard(card: ContentCard, colWidth: Int = 12)(implicit requestHeader: RequestHeader): Option[Html] = {
    val width = ((colWidth.toDouble / 12.toDouble) * FrontEmailImage.knownWidth).toInt
    imageUrlFromCard(card, width).map { url => Html {
        s"""<a class="fc-link" ${card.header.url.hrefWithRel}>${img(width)(url, Some(card.header.headline))}</a>"""
      }
    }
  }

  object Images {
    val footerG = Static("images/email/grey-g.png")
    val quote = Static("images/email/quote.png")
    val play = Static("images/email/icons/play.png")
  }
}
