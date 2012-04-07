package frontend.common

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class TemplatesTest extends FlatSpec with ShouldMatchers {

  "JavaScriptString" should "escape javascript" in {

    JavaScriptString("hello 'world'").body should be ("""hello \'world\'""")

  }
}
