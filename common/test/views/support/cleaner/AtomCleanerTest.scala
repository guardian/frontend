package views.support.cleaner

import implicits.FakeRequests
import model.content.{Atoms, MediaAsset, MediaAtom}
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.scalatest.{FlatSpec, Matchers}
import test.TestRequest
import views.support.AtomsCleaner
import conf.switches.Switches

class AtomCleanerTest extends FlatSpec with Matchers with FakeRequests {
  val youTubeAtom = Some(Atoms(quizzes = Nil,
    media = Seq(MediaAtom(id = "887fb7b4-b31d-4a38-9d1f-26df5878cf9c",
      defaultHtml = "<iframe width=\"420\" height=\"315\"\n src=\"https://www.youtube.com/embed/nQuN9CUsdVg\" frameborder=\"0\"\n allowfullscreen=\"\">\n</iframe>",
      assets = Seq(MediaAsset(id = "nQuN9CUsdVg", version = 1L, platform = "Youtube", mimeType = None)),
      title = "Bird",
      duration = None,
      source = None,
      posterUrl = None)
    )
  )
)
 private def clean(document: Document, atom:Option[Atoms]): Document = {
    val cleaner = AtomsCleaner(youTubeAtom)(TestRequest())
    cleaner.clean(document)
    document
  }

  "AtomsCleaner" should "create YouTube template" in {
    Switches.UseAtomsSwitch.switchOn()
    val doc = Jsoup.parse( s"""<figure class="element element-atom">
                                <gu-atom data-atom-id="887fb7b4-b31d-4a38-9d1f-26df5878cf9c" data-atom-type="media">
                                <div>
                                 <iframe src="https://www.youtube.com/embed/nQuN9CUsdVg" allowfullscreen="" width="420" height="315" frameborder="0"> </iframe>
                                 </div>
                                </gu-atom>
                               </figure>""")
    val result: Document = clean(doc, youTubeAtom)
    result.select("iframe").attr("id") shouldBe("youtube-nQuN9CUsdVg")
    result.select("iframe").attr("src") should include("enablejsapi=1")

  }

}
