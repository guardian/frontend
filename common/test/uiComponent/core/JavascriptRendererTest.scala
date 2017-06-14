package uiComponent.core

import java.io.FileNotFoundException

import helpers.ExceptionMatcher
import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.json.{JsObject, JsString}
import test.WithTestContext

import scala.util.Try

class JavascriptRendererTest
  extends FlatSpec
  with Matchers
  with WithTestContext
  with ExceptionMatcher {

  "Rendering" should "return correct HTML string" in {
    val rendered = new JavascriptRenderer("components/TestButtonComponent.js")
    val state: Option[JsObject] = Some(JsObject(Seq("title" -> JsString("my title"))))
    rendered.render(state) should be (Try("<button type='button'>my title</button>"))
  }

  it should "fail if javascript file doesn't exist" in {
    val rendered = new JavascriptRenderer("does-not-exists.js")
    rendered.render() should failAs(classOf[FileNotFoundException])
  }


}
