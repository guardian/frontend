package components.core

import play.twirl.api.Txt
import scala.language.implicitConversions

case class Css(asString: String) {
  def :+(css: Css): Css = Css(asString + css.asString)
}

object Css {
  def empty: Css = Css("")
  implicit def txtToCss(txt: Txt): Css = Css(txt.toString)
}



