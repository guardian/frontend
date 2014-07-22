package views.support

import org.scalatest.{Matchers, FlatSpec}
import ListTemplate._

class ListTemplateTest extends FlatSpec with Matchers {
  "zipWithIsLast" should "zip with whether the element is the last in the list" in {
    zipWithIsLast(Seq(1, 2, 3)) shouldEqual Seq(1 -> false, 2 -> false, 3 -> true)
  }
}
