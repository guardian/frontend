package views.support

import conf.Static
import layout.ContentCard
import model._
import play.twirl.api.Html
import play.api.mvc._

object EmailHelpers {
  // TODO: implicit conversions so I don't have to call render all over the place??
  case class Container(rows: Row*) {
    def render: Html = Html {
      s"""<table align="center" class="container">
         |  <tbody>
         |    <tr>
         |      <td>
         |        ${rows.map(_.render).mkString}
         |      </td>
         |    </tr>
         |  </tbody>
         |</table>""".stripMargin
    }
  }

  case class Row(columns: Column*) {
    def render: Html = {
      val cols = columns.zipWithIndex.map { case (col, i) =>
        col.render(i == 0, i == columns.length - 1)
      }

      Html {
        s"""<table class="row">
           |  <tbody>
           |    <tr>
           |      ${cols.mkString}
           |    </tr>
           |  </tbody>
           |</table>""".stripMargin
      }
    }
  }

  case class Column(smallWidth: Int, largeWidth: Int, classes: Seq[String] = Seq())(inner: Html) {
    def render(first: Boolean = false, last: Boolean = false): Html = Html {
      s"""<th class="${if (first) {"first"} else {""}} ${if (last) {"last"} else {""}} small-${smallWidth} large-${largeWidth} columns">
         |  <table>
         |    <tr>
         |      <th class="${classes.mkString(" ")}">$inner</th>
         |      <th class="expander"></th>
         |    </tr>
         |  </table>
         |</th>""".stripMargin
    }
  }

  def fullRow(inner: Html): Html = Row(
    Column(smallWidth = 12, largeWidth = 12)(inner)
  ).render

  def fullRow(classes: Seq[String] = Seq.empty)(inner: Html): Html = Row(
    Column(smallWidth = 12, largeWidth = 12, classes)(inner)
  ).render

  def paddedRow(inner: Html): Html = Row(
    Column(smallWidth = 12, largeWidth = 12, Seq("panel"))(inner)
  ).render

  def paddedRow(classes: Seq[String] = Seq.empty)(inner: Html): Html = Row(
    Column(smallWidth = 12, largeWidth = 12, classes ++ Seq("panel"))(inner)
  ).render

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

  def icon(name: String, largeHeadline: Boolean = false) = Html {
    val height = if(largeHeadline) 18 else 12
    s"""<img height="$height" src="${Static(s"images/email/icons/$name.png")}" class="icon icon-$name">"""
  }

  private def img(width: Int)(src: String, alt: Option[String] = None) = Html {
    s"""<img width="$width" class="full-width" src="$src" ${alt.map(alt => s"""alt="$alt"""").getOrElse("")}>"""
  }

  def imgForArticle = img(EmailImage.knownWidth) _

  def imgForFront = img(FrontEmailImage.knownWidth) _

  def imgFromCard(card: ContentCard, colWidth: Int = 12)(implicit requestHeader: RequestHeader): Option[Html] = imageUrlFromCard(card).map { url => Html {
      val width = ((colWidth.toDouble / 12.toDouble) * FrontEmailImage.knownWidth).toInt
      s"""<a class="facia-link" ${card.header.url.hrefWithRel}>${img(width)(url, Some(card.header.headline))}</a>"""
    }
  }



  object Images {
    val footerG = Static("images/email/grey-g.png")
    val quote = Static("images/email/quote.png")
    val play = Static("images/email/icons/play.png")
  }
}
