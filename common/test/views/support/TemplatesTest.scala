package views.support

import com.gu.openplatform.contentapi.model.{ Tag => ApiTag }
import model._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import xml.XML
import common.editions.Uk

class TemplatesTest extends FlatSpec with ShouldMatchers {

  "RemoveOuterPara" should "remove outer paragraph tags" in {
    RemoveOuterParaHtml(" <P> foo <b>bar</b> </p> ").body should be(" foo <b>bar</b> ")
  }

  it should "not modify text that is not enclosed in p tags" in {
    RemoveOuterParaHtml("  foo <b>bar</b>").body should be("  foo <b>bar</b>")
  }

  "typeOrTone" should "ignore Article and find Video" in {
    val tags = new Tags {
      override val tags = Seq(
        Tag(tag(id = "type/article", tagType = "type")),
        Tag(tag(id = "tone/foo", tagType = "tone")),
        Tag(tag(id = "type/video", tagType = "type"))
      )
    }
    tags.typeOrTone.get.id should be("type/video")
  }

  it should "find tone when only content type is Article" in {
    val tags = new Tags {
      override val tags = Seq(
        Tag(tag(id = "type/article", tagType = "type")),
        Tag(tag(id = "tone/foo", tagType = "tone"))
      )
    }
    tags.typeOrTone.get.id should be("tone/foo")
  }

  "Inflector" should "singularize tag name" in {
    Tag(tag("Minute by minutes")).singularName should be("Minute by minute")
    Tag(tag("News")).singularName should be("News")
  }

  it should "pluralize tag name" in {
    Tag(tag("Article")).pluralName should be("Articles")
  }

  "javaScriptVariableName" should "create a sensible Javascript name" in {

    JavaScriptVariableName("web-publication-date") should be("webPublicationDate")
    JavaScriptVariableName("series") should be("series")
  }

  "PictureCleaner" should "correctly format inline pictures" in {

    val images = new Elements {
      override def images = Nil
      override def videos = Nil
      override def thumbnail = None
      override def mainPicture = None
    }

    val body = XML.loadString(withJsoup(bodyTextWithInlineElements)(PictureCleaner(images)).body.trim)

    val figures = (body \\ "figure").toList

    val baseImg = figures(1)
    (baseImg \ "@class").text should include("img--base img--inline")
    (baseImg \ "img" \ "@class").text should be("gu-image")
    (baseImg \ "img" \ "@width").text should be("140")

    val medianImg = figures(2)
    (medianImg \ "@class").text should include("img--median img--inline")
    (medianImg \ "img" \ "@class").text should be("gu-image")
    (medianImg \ "img" \ "@width").text should be("250")

    val extendedImg = figures(0)
    (extendedImg \ "@class").text should include("img--extended")
    (extendedImg \ "img" \ "@class").text should be("gu-image")
    (extendedImg \ "img" \ "@width").text should be("600")

    val landscapeImg = figures(3)
    (landscapeImg \ "@class").text should include("img--landscape")
    (landscapeImg \ "img" \ "@class").text should be("gu-image")
    (landscapeImg \ "img" \ "@width").text should be("500")

    val portaitImg = figures(4)
    (portaitImg \ "@class").text should include("img--portrait")
    (portaitImg \ "img" \ "@class").text should be("gu-image")
    (portaitImg \ "img" \ "@height").text should be("700")

    (body \\ "figure").foreach { fig =>
      (fig \ "@itemprop").text should be("associatedMedia")
      (fig \ "@itemscope").text should be("")
      (fig \ "@itemtype").text should be("http://schema.org/ImageObject")
    }

    (body \\ "figcaption").foreach { fig =>
      (fig \ "@itemprop").text should be("description")
      (fig).text should include("Image caption")
    }
  }

  "InBodyLinkCleaner" should "clean links" in {
    val body = XML.loadString(withJsoup(bodyTextWithLinks)(InBodyLinkCleaner("in body link")(Uk)).body.trim)

    val link = (body \\ "a").head

    (link \ "@href").text should be("/section/2011/jan/01/words-for-url")

  }

  "BlockCleaner" should "insert block ids in minute by minute content" in {

    val body = withJsoup(bodyWithBLocks)(BlockNumberCleaner).body.trim

    body should include("""<span id="block-14">some heading</span>""")
    body should include("""<p id="block-1">some more text</p>""")
  }

  "BulletCleaner" should "format all bullets by wrapping in a span" in {
    BulletCleaner("<p>Foo bar • foo</p>") should be("<p>Foo bar <span class=\"bullet\">•</span> foo</p>")
  }

  "RowInfo" should "add row info to a sequence" in {

    val items = Seq("a", "b", "c", "d")

    items.zipWithRowInfo should be(Seq(
      ("a", RowInfo(1)), ("b", RowInfo(2)), ("c", RowInfo(3)), ("d", RowInfo(4, true))
    ))

  }

  it should "correctly understand row position" in {
    val first = RowInfo(1)
    first.isFirst should be(true)
    first.isLast should be(false)
    first.isEven should be(false)
    first.isOdd should be(true)
    first.rowClass should be("first odd")

    val second = RowInfo(2)
    second.isFirst should be(false)
    second.isLast should be(false)
    second.isEven should be(true)
    second.isOdd should be(false)
    second.rowClass should be("even")

    val last = RowInfo(7, true)
    last.isFirst should be(false)
    last.isLast should be(true)
    last.isEven should be(false)
    last.isOdd should be(true)
    last.rowClass should be("last odd")
  }

  "SafeName" should "understand the Javascript name of top stories" in {
    SafeName(ItemTrailblockDescription("", "News", 3)(Uk)) should be("top-stories")
  }

  it should "understand a section" in {
    SafeName(ItemTrailblockDescription("sport", "Sport", 3)(Uk)) should be("sport")
  }

  it should "understand a tag" in {
    SafeName(ItemTrailblockDescription("sport/triathlon", "Sport", 3)(Uk)) should be("sport-triathlon")
  }

  "StripHtmlTags" should "strip html from string" in {
    StripHtmlTags("<a href=\"www.guardian.co.uk\">Foo <b>Bar</b></a>") should be("Foo Bar")
  }

  it should "convert to html entites" in {
    StripHtmlTags("This is \"sarcasm\" & so is \"this\"") should be("This is &quot;sarcasm&quot; &amp; so is &quot;this&quot;")
  }

  private def tag(name: String = "name", tagType: String = "keyword", id: String = "/id") = {
    ApiTag(id = id, `type` = tagType, webTitle = name,
      sectionId = None, sectionName = None, webUrl = "weburl", apiUrl = "apiurl", references = Nil)
  }

  val bodyTextWithInlineElements = """
  <span>
    <p>more than hearty breakfast we asked if the hotel could find out if nearby Fraserburgh was open. "Yes, but bring your own snorkel," was the response. How could we resist?</p>

    <figure>
      <img src='http://www.a.b.c/img3' alt='Meldrum House in Oldmeldrum\n' width='600' height='180' class='gu-image'/>
    </figure>

     <figure>
       <img src='http://www.a.b.c/img.jpg' alt='Meldrum House in Oldmeldrum\n' width='140' height='84' class='gu-image'/>
       <figcaption></figcaption>
     </figure>


     <figure>
       <img src='http://www.a.b.c/img2.jpg' alt='Meldrum House in Oldmeldrum\n' width='250' height='100' class='gu-image'/>
       <figcaption>Image caption</figcaption>
     </figure>


     <figure>
       <img src='http://www.a.b.c/img2.jpg' alt='Meldrum House in Oldmeldrum\n' width='500' height='100' class='gu-image'/>
       <figcaption>Image caption</figcaption>
     </figure>


     <figure>
       <img src='http://www.a.b.c/img2.jpg' alt='Meldrum House in Oldmeldrum\n' width='500' height='700' class='gu-image'/>
       <figcaption>Image caption</figcaption>
     </figure>

    <p>But first to <a href="http://www.glengarioch.com/verify.php" title="">Glen Garioch distillery</a></p>
  </span>
                                   """

  val bodyTextWithLinks = """
    <p>bar <a href="http://www.theguardian.com/section/2011/jan/01/words-for-url">the link</a></p>
                          """

  val bodyWithBLocks = """<body>
      <!-- Block 14 --><span>some heading</span><p>some text</p>
      <!-- Block 1 --><p>some more text</p>
    </body>"""

}