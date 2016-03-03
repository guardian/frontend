package views.support

import conf.Static
import model.{ImageMedia, ImageAsset}
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

  def fullRowWithBackground(media: ImageMedia)(inner: Html): Html = {
    EmailArticleImage.bestFor(media).map { url =>
      Html {
        s"""<table style="background-image: url($url)" class="row background--image">
          <tr>${columns(12)(inner)}</tr>
        </table>"""
      }
    } getOrElse(fullRow(inner))
  }

  def icon(name: String) = Html {
    s"""<img src="${Static(s"images/email/icons/$name.png")}" class="icon icon-$name">"""
  }

  object Images {
    val footerG = Static("images/email/grey-g.png")
    val quote = Static("images/email/quote.png")
    val play = Static("images/email/icons/play.png")
  }
}
