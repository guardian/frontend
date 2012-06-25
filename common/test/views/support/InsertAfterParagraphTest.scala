package views.support

import com.gu.openplatform.contentapi.model.{ Tag => ApiTag }
import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import play.api.templates.Html

class InsertAfterParagraphTest extends FlatSpec with ShouldMatchers {

  val body = <div>
               <p>foo</p>
               <p>bar</p>
               <p>hellow</p>
               <p>world</p>
             </div>

  "InsertAfterParagraph" should "insert html after paragrah" in {

    val cleanedHtml = withJsoup(body.toString) {
      InsertAfterParagraph(2)(Html("<div>TheText</div>"))
    }.text

    compact(cleanedHtml) should be("<div><p>foo</p><p>bar</p><div>TheText</div><p>hellow</p><p>world</p></div>")

  }

  it should "not insert if there are not enoough paragraphs" in {

    val cleanedHtml = withJsoup(body.toString) {
      InsertAfterParagraph(10)(Html("<div>TheText</div>"))
    }.text

    compact(cleanedHtml) should be("<div><p>foo</p><p>bar</p><p>hellow</p><p>world</p></div>")

  }

  private def compact(s: String) = s.replace("\n", "").replace(" ", "")
}
