package liveblog

import controllers.ParseBlockId
import org.scalatest.{FlatSpec, Matchers}

class ParseBlockIdTest extends FlatSpec with Matchers {

  it should "parse a with" in {
    val result = ParseBlockId.fromPageParam("with:block-asdf")

    result should be(Some("asdf"))
  }

  it should "not parse a blah" in {
    val result = ParseBlockId.fromBlockId("""\"'/""")

    result should be(None)
  }

}
