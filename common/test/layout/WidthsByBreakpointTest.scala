package layout

import org.scalatest.{Matchers, FlatSpec}
import BrowserWidth._
import scalaz.syntax.std.option._

class WidthsByBreakpointTest extends FlatSpec with Matchers {
  "sizesString" should "make a valid sizes string for image" in {
    WidthsByBreakpoint(
      100.perc.some,
      340.px.some,
      460.px.some
    ).sizesString shouldEqual "(min-width 980px) 460px, (min-width 740px) 340px, 100%"
  }
}
