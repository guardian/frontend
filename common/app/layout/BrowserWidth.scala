package layout

object BrowserWidth {
  implicit class RichInt(n: Int) {
    def px = PixelWidth(n)
    def perc = PercentageWidth(n)
    def vw = ViewportWidth(n)
  }
}

sealed trait BrowserWidth {
  def get: Int
}

case class PercentageWidth(get: Int) extends BrowserWidth {
  override def toString = s"$get%"
}

case class PixelWidth(get: Int) extends BrowserWidth {
  override def toString = s"${get}px"
}

case class ViewportWidth(get: Int) extends BrowserWidth {
  override def toString = s"${get}vw"
}
