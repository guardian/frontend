package utils

import com.gu.contentapi.client.model.v1.{BlockElement, Blocks, ElementType, TextElementFields}
import contentapi.FixtureTemplates
import model.content.{Atoms, InteractiveAtom}
import model.meta.BlocksOn
import model.{Content, GenericContent, SimpleContentPage}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class LiveHarnessTest extends AnyFlatSpec with Matchers {
  private val emptyAtoms = Atoms(
    audios = Seq.empty,
    charts = Seq.empty,
    commonsdivisions = Seq.empty,
    explainers = Seq.empty,
    guides = Seq.empty,
    interactives = Seq.empty,
    media = Seq.empty,
    profiles = Seq.empty,
    qandas = Seq.empty,
    quizzes = Seq.empty,
    reviews = Seq.empty,
    timelines = Seq.empty,
    callToAction = Seq.empty,
  )

  "inject" should "preserve existing content atom interactives when adding harness interactives" in {
    implicit val updater: LiveHarness.PageUpdater[SimpleContentPage] =
      (page, newContent) => page.copy(content = GenericContent(newContent))

    val existingInteractive = InteractiveAtom(
      id = "/interactive/existing-atom",
      `type` = "interactive",
      title = "Existing atom",
      css = "",
      html = "<div>Existing</div>",
      mainJS = Some("console.log('existing');"),
      docData = None,
      placeholderUrl = None,
    )

    val harnessInteractive = LiveHarnessInteractiveAtom(
      id = "/interactive/harness-atom",
      title = "Harness atom",
      css = "",
      html = "<div>Harness</div>",
      js = "console.log('harness');",
      weighting = "inline",
    )

    val contentWithExistingInteractive = Content(FixtureTemplates.emptyApiContent).content
      .copy(atoms = Some(emptyAtoms.copy(interactives = Seq(existingInteractive))))
    val page = SimpleContentPage(GenericContent(contentWithExistingInteractive))
    val blocksOn = BlocksOn(page, Blocks(body = None))

    val updated = LiveHarness.inject[SimpleContentPage](Seq(harnessInteractive))(updater)(blocksOn)

    updated.page.item.content.atoms.get.interactives shouldEqual Seq(existingInteractive, harnessInteractive.atom)
  }

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

  it should "strip void elements and split remaining tags" in {
    val html = "<p>First</p><p>Second</p><br><h2>A heading</h2>"
    LiveHarness.splitIntoTags(html) shouldEqual List(
      "<p>First</p>",
      "<p>Second</p>",
      "<h2>A heading</h2>",
    )
  }
}
