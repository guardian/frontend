package common

import org.scalatest.{FreeSpec, Matchers}

class HTMLTest extends FreeSpec with Matchers {

  "takeFirstNElements" - {
    "should return nothing" in {
      HTML.takeFirstNElements("", 100) should be("")
    }

    "should return first 2 elements" in {
      val html = "<p>1</p><p>2</p><p>3</p>"
      HTML.takeFirstNElements(html, 2) should be("<p>1</p><p>2</p>")
    }

    "should return first 3 mixed elements" in {
      val html = "<p>1</p><div>2</div><span>3</span><section>section</section>"
      //It adds linebreaks to divs and probably other block elements
      HTML.takeFirstNElements(html, 3) should be("<p>1</p><div>\n 2\n</div><span>3</span>")
    }

    "should return first 2 in mixed nested elements" in {
      val html =
        """
          |<div id="123">
          |  <h1>Header</h1>
          |  <p>stuff</p>
          |</div>
          |<span>
          |  <p>Stuff</p>
          |</span>
          |<div>
          |  <span>thing</span>
          |</div>
        """.stripMargin
      HTML.takeFirstNElements(html, 2) should be(
        "<div id=\"123\"> \n <h1>Header</h1> \n <p>stuff</p> \n</div><span> <p>Stuff</p> </span>",
      )
    }

  }
}
