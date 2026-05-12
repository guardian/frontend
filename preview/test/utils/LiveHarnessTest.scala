package utils

import com.gu.contentapi.client.model.v1.{BlockElement, ElementType, TextElementFields}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class LiveHarnessTest extends AnyFlatSpec with Matchers {

  "insertAtomsAtNthPoints" should "place atoms at the appropriate positions in the body" in {
    val elements = Seq(
      BlockElement(
        `type` = ElementType.Text,
        textTypeData = Some(TextElementFields(html = Some("<p>First</p><p>Second</p><h2>A heading</h2>"))),
      ),
    )
    val liveHarnessAtom =
      LiveHarnessInteractiveAtom(
        id = "/interactive/my-atom",
        title = "My Atom",
        css = "p { color: red };",
        html = "<div><h1>Hello, world!</h1><p>I am an interactive atom.</p></div>",
        js = "",
        weighting = "inline",
        position = Some(2),
      )
    LiveHarness.insertAtomsAtNthPoints(elements, Seq(liveHarnessAtom)) shouldEqual IndexedSeq(
      BlockElement(
        `type` = ElementType.Text,
        textTypeData = Some(TextElementFields(html = Some("<p>First</p>"))),
      ),
      liveHarnessAtom.blockElement,
      BlockElement(
        `type` = ElementType.Text,
        textTypeData = Some(TextElementFields(html = Some("<p>Second</p>\n<h2>A heading</h2>"))),
      ),
    )
  }

  "splitIntoTags" should "split a multi-paragraph html blob into individual tags" in {
    val html = "<p>First</p>\n<p>Second</p>\n<h2>A heading</h2>"
    LiveHarness.splitIntoTags(html) shouldEqual List(
      "<p>First</p>",
      "<p>Second</p>",
      "<h2>A heading</h2>",
    )
  }

  it should "filter out whitespace-only nodes" in {
    val html = "<p>First</p>\n\n   \n<p>Second</p>"
    LiveHarness.splitIntoTags(html) should have length 2
  }

  it should "handle an empty string" in {
    LiveHarness.splitIntoTags("") shouldEqual List.empty
  }
}
