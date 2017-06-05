package views.support.cleaner

import com.gu.contentapi.client.model.v1.{Asset, AssetType}
import implicits.FakeRequests
import model.content._
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.scalatest.{FlatSpec, Matchers}
import test.{TestRequest, WithTestContext}
import views.support.AtomsCleaner
import conf.switches.Switches
import model.{ImageAsset, ImageMedia}

import scala.collection.JavaConverters._

class AtomCleanerTest extends FlatSpec
  with Matchers
  with WithTestContext
  with FakeRequests {

  val asset: Asset = Asset(
    AssetType.Image,
    Some("image/jpeg"),
    Some("https://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.jpeg"),
    None
  )
  val imageAsset: ImageAsset = ImageAsset.make(asset, 1)

  val image: ImageMedia = ImageMedia.apply(Seq(imageAsset))

  val youTubeAtom = Some(Atoms(quizzes = Nil,
    media = Seq(MediaAtom(id = "887fb7b4-b31d-4a38-9d1f-26df5878cf9c",
      defaultHtml = "<iframe width=\"420\" height=\"315\"\n src=\"https://www.youtube.com/embed/nQuN9CUsdVg\" frameborder=\"0\"\n allowfullscreen=\"\">\n</iframe>",
      assets = Seq(MediaAsset(id = "nQuN9CUsdVg", version = 1L, platform = MediaAssetPlatform.Youtube, mimeType = None)),
      title = "Bird",
      duration = Some(36),
      source = None,
      posterImage = Some(image),
      endSlatePath = Some("/video/end-slate/section/football.json?shortUrl=https://gu.com/p/6vf9z"),
      expired = None)
    ),
    interactives = Nil,
    recipes = Nil,
    reviews = Nil,
    storyquestions = Nil,
    explainers = Nil
  )
)
  def doc: Document = Jsoup.parse( s"""<figure class="element element-atom">
                                <gu-atom data-atom-id="887fb7b4-b31d-4a38-9d1f-26df5878cf9c" data-atom-type="media">
                                <div>
                                 <iframe src="https://www.youtube.com/embed/nQuN9CUsdVg" allowfullscreen="" width="420" height="315" frameborder="0"> </iframe>
                                 </div>
                                </gu-atom>
                               </figure>""")


 private def clean(document: Document, atom:Option[Atoms], amp: Boolean): Document = {
    val cleaner = AtomsCleaner(youTubeAtom, amp = amp)(TestRequest(), testContext)
    cleaner.clean(document)
    document
  }

  "AtomsCleaner" should "create YouTube template" in {
    Switches.UseAtomsSwitch.switchOn()
    val result: Document = clean(doc, youTubeAtom, amp = false)
    result.select("iframe").attr("id") shouldBe "youtube-nQuN9CUsdVg"
    result.select("iframe").attr("src") should include("enablejsapi=1")
    result.select("figcaption").html should include("Bird")
  }

  "AtomsCleaner" should "use amp-youtube markup if amp is true" in {
    Switches.UseAtomsSwitch.switchOn()
    val result: Document = clean(doc, youTubeAtom, amp = true)
    result.select("amp-youtube").attr("data-videoid") should be("nQuN9CUsdVg")
  }

  "Youtube template" should "include endslate path" in {
    val html = views.html.fragments.atoms.youtube(media = youTubeAtom.map(_.media.head).get, displayEndSlate = true, displayCaption = false, mediaWrapper = None)(TestRequest())
    val doc = Jsoup.parse(html.toString())
    doc.select("div.youtube-media-atom").first().attr("data-end-slate") should be("/video/end-slate/section/football.json?shortUrl=https://gu.com/p/6vf9z")
  }

  "Youtube template" should "include main media caption" in {
    val html = views.html.fragments.atoms.youtube(media = youTubeAtom.map(_.media.head).get, displayEndSlate = true, displayCaption = true, mediaWrapper = Some(MediaWrapper.MainMedia))(TestRequest())
    val doc = Jsoup.parse(html.toString())
    doc.select("figcaption").hasClass("caption--main") should be(true)
  }

  "Youtube template" should "include duration" in {
    val html = views.html.fragments.atoms.media(media = youTubeAtom.map(_.media.head).get, displayCaption = false, mediaWrapper = None)(TestRequest())
    val doc = Jsoup.parse(html.toString())
    doc.getElementsByClass("youtube-media-atom__bottom-bar__duration").html() should be("0:36")
  }

  "Formatted duration" should "produce the expected format" in {
    youTubeAtom.map(_.media.head).get.copy(duration = Some(61)).formattedDuration should contain("1:01")
    youTubeAtom.map(_.media.head).get.copy(duration = Some(70)).formattedDuration should contain("1:10")
    youTubeAtom.map(_.media.head).get.copy(duration = Some(660)).formattedDuration should contain("11:00")
    youTubeAtom.map(_.media.head).get.copy(duration = Some(1)).formattedDuration should contain("0:01")
    youTubeAtom.map(_.media.head).get.copy(duration = Some(3601)).formattedDuration should contain("1:00:01")
  }



}
