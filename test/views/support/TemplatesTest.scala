package views.support

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import com.gu.openplatform.contentapi.model.{ Tag => ApiTag }
import common.{ Tags, Tag }
import xml.XML

class TemplatesTest extends FlatSpec with ShouldMatchers {

  "RemoveOuterPara" should "remove outer paragraph tags" in {
    RemoveOuterParaHtml(" <P> foo <b>bar</b> </p> ").text should be(" foo <b>bar</b> ")
  }

  it should "not modify text that is not enclosed in p tags" in {
    RemoveOuterParaHtml("  foo <b>bar</b>").text should be("  foo <b>bar</b>")
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

  "InlinePicturesFormatter" should "correctly format inline pictures" in {
    val body = XML.loadString(PictureTransformerHtml(bodyTextWithInlineElements).text.trim)

    val imgDivs = (body \\ "div").toList

    val baseImg = imgDivs(1)
    (baseImg \ "@class").text should be("img-base")
    (baseImg \ "img" \ "@class").text should be("gu-image")
    (baseImg \ "img" \ "@width").text should be("140")

    val medianImg = imgDivs(2)
    (medianImg \ "@class").text should be("img-median")
    (medianImg \ "img" \ "@class").text should be("gu-image")
    (medianImg \ "img" \ "@width").text should be("250")

    val extendedImg = imgDivs(0)
    (extendedImg \ "@class").text should be("img-extended")
    (extendedImg \ "img" \ "@class").text should be("gu-image")
    (extendedImg \ "img" \ "@width").text should be("600")
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

  private def tag(name: String = "name", tagType: String = "keyword", id: String = "/id") = {
    ApiTag(id = id, `type` = tagType, webTitle = name,
      sectionId = None, sectionName = None, webUrl = "weburl", apiUrl = "apiurl", references = Nil)
  }

  val bodyTextWithInlineElements = """
  <span>
  <p>foo bar</p>

  <img src="http://www.a.b.c/img3.jpg" class="gu-image" width="600" height="180"/>

  <img src="http://www.a.b.c/img.jpg" class="gu-image" width="140" height="84"/>

  <p>lorem ipsum
    <img src="http://www.a.b.c/img2.jpg" class="gu-image" width="250" height="100"/>
  </p>
  </span>
  """

}
