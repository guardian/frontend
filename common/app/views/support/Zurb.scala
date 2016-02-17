package views.support

import play.twirl.api.Html

object Zurb {
  def columnNumber(n: Int): String = {
    Seq("one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve").lift(n - 1).getOrElse("")
  }

  def row(inner: Html): Html = Html {
    s"""<table class="row">
          <tr>$inner</tr>
        </table>"""
  }

  def columns(n: Int, innerClasses: Seq[String] = Seq(), last: Boolean = false)(inner: Html): Html = Html {
    s"""<td class="wrapper ${if (last || n == 12) "last"}">
      <table class="${columnNumber(n)} columns">
        <tr>
          <td ${if (innerClasses.nonEmpty) s"class=${innerClasses.mkString(" ")}"}>$inner</td>
          <td class="expander"></td>
        </tr>
      </table>
    </td>"""
  }

  def fullRow(inner: Html): Html = row(columns(12)(inner))
  def paddedRow(inner: Html): Html = row(columns(12, Seq("panel"))(inner))
}
