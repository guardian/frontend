package frontend.common

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class TemplatesTest extends FlatSpec with ShouldMatchers {

  "JavaScriptString" should "escape javascript" in {

    JavaScriptString("hello 'world'").body should be("""hello \'world\'""")

  }

  "RemoveOuterPara" should "remove outer paragraph tags" in {
    RemoveOuterParaHtml(" <P> foo <b>bar</b> </p> ").text should be(" foo <b>bar</b> ")
  }

  it should "not modify text that is not enclosed in p tags" in {
    RemoveOuterParaHtml("  foo <b>bar</b>").text should be("  foo <b>bar</b>")
  }
}
