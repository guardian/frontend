package views.support

import common._
import java.net.URLEncoder._
import model._
import org.jsoup.nodes.Document
import org.jsoup.Jsoup
import org.jboss.dna.common.text.Inflector
import play.api.libs.json.Writes
import play.api.libs.json.Json._
import play.api.templates.Html
import scala.collection.JavaConversions._

import scala.Some
import play.api.mvc.RequestHeader

object JSON {
  //we wrap the result in an Html so that play does not escape it as html
  //after we have gone to the trouble of escaping it as Javascript
  def apply[T](json: T)(implicit tjs: Writes[T]): Html = Html(stringify(toJson(json)))
}

//annoyingly content api will sometimes have things surrounded by <p> tags and sometimes not.
//since you cannot nest <p> tags this causes all sorts of problems
object RemoveOuterParaHtml {
  def apply(text: String): Html = {
    val fragment = Jsoup.parseBodyFragment(text).body()
    if (!fragment.html().startsWith("<p>")) {
      Html(text)
    } else {
      Html(fragment.html.drop(3).dropRight(4))
    }
  }
}

object JavaScriptValue {
  def apply(s: String): String = {
    s.replace("'", "\\'")
  }
}

object JavaScriptVariableName {
  def apply(s: String): String = {
    val parts = s.split("-").toList
    (parts.headOption.toList ::: parts.tail.map { firstLetterUppercase }) mkString
  }
  private def firstLetterUppercase(s: String) = s.head.toUpper + s.tail
}

case class RowInfo(rowNum: Int, isLast: Boolean = false) {
  lazy val isFirst = rowNum == 1
  lazy val isEven = rowNum % 2 == 0
  lazy val isOdd = !isEven
  lazy val rowClass = rowNum match {
    case 1 => "first " + _rowClass
    case _ if isLast => "last " + _rowClass
    case _ => _rowClass
  }
  private lazy val _rowClass = if (isEven) "even" else "odd"

  def indexIsInSameCarousel(carouselWidth: Int, candidate: Int): Boolean = {
    val tolerance = (carouselWidth - 1) / 2 // Your problem if carouselWidth % 2 == 0
    val carousel = (rowNum - tolerance) to (rowNum + tolerance)
    carousel contains candidate
  }
}

trait HtmlCleaner {
  def clean(d: Document): Document
}

case class PictureCleaner(imageHolder: Images) extends HtmlCleaner {
  def clean(body: Document): Document = {
    val apiImages = imageHolder.images
    val images = body.getElementsByAttributeValue("class", "gu-image")

    images.foreach { img =>

      val imgUrl = img.attr("src")
      val imageFromApi: Option[Image] = apiImages.find(_.url == Some(imgUrl))

      val imgWidth = img.attr("width").toInt
      val wrapper = body.createElement("div")
      wrapper.attr("class", imgWidth match {
        case width if width <= 220 => "img-base"
        case width if width < 460 => "img-median"
        case width => "img-extended"
      })

      img.replaceWith(wrapper)
      wrapper.appendChild(img)

      imageFromApi foreach { i: Image =>
        i.caption foreach { c =>
          val caption = body.createElement("p")
          caption.attr("class", "caption")
          caption.text(c)
          wrapper.appendChild(caption)
        }
      }
    }

    body
  }
}

object InBodyLinkCleaner extends HtmlCleaner {
  def clean(body: Document): Document = {
    val links = body.getElementsByTag("a")

    links.foreach { link =>
      link.attr("href", InBodyLink(link.attr("href")))
      link.attr("data-link-name", "in body link")
    }
    body
  }
}

// beta.guardian.co.uk goes in A group
// test.guardian.co.uk goes in B group
object ABTest {
  def apply(implicit request: RequestHeader) = new {
    val isB = request.getQueryString("host").map(_ == "test").getOrElse(request.host.contains("frontend-router-prod"))
    val isA = !isB
  }
}

object TagLinks {
  def apply(text: String, tags: Seq[Tag]): Html = Html {
    tags.foldLeft(text) {
      case (t, tag) =>
        t.replaceFirst(tag.name, <a data-link-name="auto tag link" href={ "/" + tag.id }>{ tag.name }</a>.toString)
    }
  }
  def apply(html: Html, tags: Seq[Tag]): Html = apply(html.text, tags)
}

object OmnitureAnalyticsData {
  def apply(page: MetaData): Html = {

    val data = page.metaData.map { case (key, value) => key -> value.toString }
    val pageCode = data.get("page-code").getOrElse("")
    val contentType = data.get("content-type").getOrElse("")
    val section = data.get("section").getOrElse("")

    val analyticsData = Map(
      "pageName" -> (data("web-title").take(72) + (":%s:%s" format (contentType, pageCode))),
      "ch" -> section,
      "c9" -> section,
      "c4" -> data.get("keywords").getOrElse(""),
      "c6" -> data.get("author").getOrElse(""),
      "c8" -> pageCode,
      "c10" -> data.get("tones").getOrElse(""),
      "c11" -> section,
      "c13" -> data.get("series").getOrElse(""),
      "c25" -> data.get("blogs").getOrElse(""),
      "c14" -> data("build-number")
    )

    Html(analyticsData map { case (key, value) => key + "=" + encode(value, "UTF-8") } mkString ("&"))
  }
}

object InsertAfterParagraph {

  //paragraph index is 1 based, not 0 based
  def apply(paragraphIndex: Int)(html: Html): HtmlCleaner = new HtmlCleaner {
    def clean(body: Document) = {
      val paras = body.getElementsByTag("p")
      val targetPara = if (paras.length > paragraphIndex) Some(paras(paragraphIndex - 1)) else None
      targetPara foreach (_.after(html.body))
      body
    }
  }
}

object `package` extends Formats {

  private object inflector extends Inflector

  def withJsoup(html: String)(cleaners: HtmlCleaner*): Html = {
    val cleanedHtml = cleaners.foldLeft(Jsoup.parseBodyFragment(html)) { case (html, cleaner) => cleaner.clean(html) }
    Html(cleanedHtml.body.html)
  }

  implicit def tags2tagUtils(t: Tags) = new {
    def typeOrTone: Option[Tag] = t.types.find(_.id != "type/article").orElse(t.tones.headOption)
  }

  implicit def tags2inflector(t: Tag) = new {
    lazy val singularName: String = inflector.singularize(t.name)
    lazy val pluralName: String = inflector.pluralize(t.name)
  }

  implicit def seq2zipWithRowInfo[A](seq: Seq[A]) = new {
    def zipWithRowInfo = seq.zipWithIndex.map {
      case (item, index) => (item, RowInfo(index + 1, seq.length == index + 1))
    }
  }
}
