package layout

object BrowserWidth {
  implicit class RichInt(n: Int) {
    def px: PixelWidth = PixelWidth(n)
    def perc: BrowserWidth = PercentageWidth(n)
    def vw: BrowserWidth = ViewportWidth(n)
  }
}

sealed trait BrowserWidth {
  def get: Int
}

case class PercentageWidth(get: Int) extends BrowserWidth {
  override def toString: String = s"$get%"
}

case class PixelWidth(get: Int) extends BrowserWidth {
  override def toString: String = s"${get}px"
}

case class ViewportWidth(get: Int) extends BrowserWidth {
  override def toString: String = s"${get}vw"
}
