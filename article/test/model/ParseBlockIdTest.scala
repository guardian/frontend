package model

import model.ParseBlockId.{InvalidFormat, ParsedBlockId}
import org.scalatest.{FlatSpec, Matchers}

class ParseBlockIdTest extends FlatSpec with Matchers {

  it should "parse a with" in {
    val result = ParseBlockId.fromPageParam("with:block-asdf")

    result should be(ParsedBlockId("asdf"))
  }

  it should "not parse a blah" in {
    val result = ParseBlockId.fromBlockId("""\"'/""")

    result should be(InvalidFormat)
  }

}
