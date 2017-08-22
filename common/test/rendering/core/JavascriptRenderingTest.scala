package rendering.core

import java.io.FileNotFoundException

import helpers.ExceptionMatcher
import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.json.{JsObject, JsString}
import test.WithTestContext

import scala.util.Try

class JavascriptRenderingTest
  extends FlatSpec
  with Matchers
  with WithTestContext
  with ExceptionMatcher {

  case class TestJavascriptRendering(jsFile: String) extends JavascriptRendering {
    override def javascriptFile = jsFile
  }

  val baseDir = "common/test/resources/components"

  "Rendering" should "return correct HTML string" in {
    val renderer = new TestJavascriptRendering(s"$baseDir/TestButtonComponent.js")
    val state: Option[JsObject] = Some(JsObject(Seq("title" -> JsString("my title"))))
    renderer.render(state) should be (Try("<button type='button'>my title</button>"))
  }

  it should "fail if javascript file doesn't exist" in {
    val renderer = new TestJavascriptRendering("does-not-exists.js")
    renderer.render() should failAs(classOf[FileNotFoundException])
  }


}
