package layout

object BrowserWidth {
  implicit class RichInt(n: Int) {
    def px = PixelWidth(n)
    def perc = PercentageWidth(n)
  }
}

sealed trait BrowserWidth

case class PercentageWidth(get: Int) extends BrowserWidth {
  override def toString = s"$get%"
}

case class PixelWidth(get: Int) extends BrowserWidth {
  override def toString = s"${get}px"
}
