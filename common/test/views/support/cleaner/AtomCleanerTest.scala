package views.support.cleaner

import com.gu.contentapi.client.model.v1.{Asset, AssetType}
import conf.switches.Switches
import implicits.FakeRequests
import model.content._
import model.{ImageAsset, ImageMedia}
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.scalatest.{FlatSpec, Matchers}
import test.{TestRequest, WithTestApplicationContext}
import views.support.AtomsCleaner

class AtomCleanerTest extends FlatSpec with Matchers with WithTestApplicationContext with FakeRequests {

  val asset: Asset = Asset(
    AssetType.Image,
    Some("image/jpeg"),
    Some(
      "https://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2013/7/5/1373023097878/b6a5a492-cc18-4f30-9809-88467e07ebfa-460x276.jpeg",
    ),
    None,
  )
  val imageAsset: ImageAsset = ImageAsset.make(asset, 1)

  val image: ImageMedia = ImageMedia.apply(Seq(imageAsset))

  val youTubeAsset =
    MediaAsset(id = "nQuN9CUsdVg", version = 1L, platform = MediaAssetPlatform.Youtube, mimeType = None)

  val youTubeAtom = Some(
    Atoms(
      quizzes = Nil,
      media = Seq(
        MediaAtom(
          id = "887fb7b4-b31d-4a38-9d1f-26df5878cf9c",
          defaultHtml =
            "<iframe width=\"420\" height=\"315\"\n src=\"https://www.youtube.com/embed/nQuN9CUsdVg\" frameborder=\"0\"\n allowfullscreen=\"\">\n</iframe>",
          assets = Seq(youTubeAsset),
          title = "Bird",
          duration = Some(36),
          source = None,
          posterImage = Some(image),
          expired = None,
          activeVersion = None,
          channelId = None,
        ),
      ),
      interactives = Nil,
      recipes = Nil,
      reviews = Nil,
      explainers = Nil,
      qandas = Nil,
      guides = Nil,
      profiles = Nil,
      timelines = Nil,
      commonsdivisions = Nil,
      audios = Nil,
      charts = Nil,
    ),
  )
  def doc: Document = Jsoup.parse(s"""<figure class="element element-atom">
                                <gu-atom data-atom-id="887fb7b4-b31d-4a38-9d1f-26df5878cf9c" data-atom-type="media">
                                <div>
                                 <iframe src="https://www.youtube.com/embed/nQuN9CUsdVg" allowfullscreen="" width="420" height="315" frameborder="0"> </iframe>
                                 </div>
                                </gu-atom>
                               </figure>""")

  private def clean(document: Document): Document = {
    val cleaner = AtomsCleaner(youTubeAtom)(TestRequest(), testApplicationContext)
    cleaner.clean(document)
    document
  }

  private def renderAndGetId(atom: MediaAtom): String = {
    val html =
      views.html.fragments.atoms.youtube(media = atom, displayCaption = false, mediaWrapper = None)(TestRequest())
    val doc = Jsoup.parse(html.toString())

    doc.getElementsByClass("youtube-media-atom__iframe").attr("id")
  }

  "AtomsCleaner" should "create YouTube template" in {
    Switches.UseAtomsSwitch.switchOn()
    val result: Document = clean(doc)
    result.select("div").attr("id") should startWith("youtube-nQuN9CUsdVg-")
    result.select("figcaption").html should include("Bird")
  }

  "Youtube template" should "include main media caption" in {
    val html = views.html.fragments.atoms.youtube(
      media = youTubeAtom.map(_.media.head).get,
      displayCaption = true,
      mediaWrapper = Some(MediaWrapper.MainMedia),
    )(TestRequest())
    val doc = Jsoup.parse(html.toString())
    doc.select("figcaption").hasClass("caption--main") should be(true)
  }

  "Youtube template" should "include duration" in {
    val html = views.html.fragments.atoms
      .media(media = youTubeAtom.map(_.media.head).get, displayCaption = false, mediaWrapper = None)(TestRequest())
    val doc = Jsoup.parse(html.toString())
    doc.getElementsByClass("youtube-media-atom__bottom-bar__duration").html() should be("0:36")
  }

  "Youtube template" should "use active asset" in {
    val atom = youTubeAtom.get.media.head.copy(
      activeVersion = Some(2L),
      assets = Seq(
        youTubeAsset.copy(id = "gyVuRflcEKM", version = 3),
        youTubeAsset.copy(id = "QRplDNMsS4U", version = 2),
        youTubeAsset,
      ),
    )

    renderAndGetId(atom) should startWith("youtube-QRplDNMsS4U")
  }

  "Youtube template" should "use latest asset if no active version" in {
    val atom = youTubeAtom.get.media.head.copy(
      assets = Seq(
        youTubeAsset.copy(id = "gyVuRflcEKM", version = 3),
        youTubeAsset.copy(id = "QRplDNMsS4U", version = 2),
      ),
    )

    renderAndGetId(atom) should startWith(s"youtube-gyVuRflcEKM")
  }

  "Youtube template" should "render nothing if there are no assets" in {
    val atom = youTubeAtom.get.media.head.copy(assets = Seq.empty)

    renderAndGetId(atom) shouldBe empty
  }

  "Formatted duration" should "produce the expected format" in {
    youTubeAtom.map(_.media.head).get.copy(duration = Some(61)).formattedDuration should contain("1:01")
    youTubeAtom.map(_.media.head).get.copy(duration = Some(70)).formattedDuration should contain("1:10")
    youTubeAtom.map(_.media.head).get.copy(duration = Some(660)).formattedDuration should contain("11:00")
    youTubeAtom.map(_.media.head).get.copy(duration = Some(1)).formattedDuration should contain("0:01")
    youTubeAtom.map(_.media.head).get.copy(duration = Some(3601)).formattedDuration should contain("1:00:01")
  }

}
