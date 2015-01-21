package layout

object BrowserWidth {
  implicit class RichInt(n: Int) {
    def px = PixelWidth(n)

    def % = PercentageWidth(n)
  }
}

sealed trait BrowserWidth

case class PercentageWidth(get: Double) extends BrowserWidth {
  override def toString = s"$get%"
}

case class PixelWidth(get: Int) extends BrowserWidth {
  override def toString = s"${get}px"
}
