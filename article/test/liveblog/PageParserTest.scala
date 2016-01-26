package liveblog

import controllers.PageParser
import org.scalatest.{FlatSpec, Matchers}

class PageParserTest extends FlatSpec with Matchers {

  it should "parse a with" in {
    val result = new PageParser().blockId("with:block-asdf")

    result should be(Some("asdf"))
  }

  it should "not parse a blah" in {
    val result = new PageParser().blockId("""\"'/""")

    result should be(None)
  }

}
