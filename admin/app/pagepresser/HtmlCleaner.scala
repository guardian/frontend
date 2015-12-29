package pagepresser

import com.netaporter.uri.Uri.parse
import org.jsoup.nodes.Document

import scala.collection.JavaConversions._


object BasicHtmlCleaner extends HtmlCleaner

trait HtmlCleaner {

  def clean(document: Document): Document = {
    removeAds(document)
    removeGoogleSearchBox(document)
    removeShareLinks(document)
    removeRelatedComponent(document)
    removeIdentityUserDetailsTab(document)
    removeInitiallyOffPlaceHolderTags(document)

    //fetch omniture data before stripping it. then rea-dd it for simple page tracking
    val omnitureQueryString = fetchOmnitureTags(document)
    removeScriptTags(document)
    removeNoScriptTags(document)
    createSimplePageTracking(document, omnitureQueryString)

  }

  def createSimplePageTracking(document: Document, omnitureParameters: String): Document = {
    //todo update where the r2-pressed page is
    val omnitureTag = "<!---Omniture page tracking for pressed page ---> <script>window.trackingQueryParams = '" + omnitureParameters +"';</script><script src=\"./r2-pressed-page.js\"></script>"

    document.body().append(omnitureTag)
    document
  }

  def fetchOmnitureTags(document: Document): String = {
    val omnitureCode = document.getElementById("omnitureNoScript").getElementsByTag("img").attr("src")
    val params = parse(omnitureCode).query.paramMap

    val requiredParams: Map[String, Seq[String]] = params.filterKeys(key => List("pageName", "ch", "g", "ns", "c19").contains(key)) ++
      Map("AQB" -> List("1"), "ndh" -> List("1"), "ce" -> List("UTF-8"), "cpd" -> List("2"), "AQE" -> List("1"), "v14" -> List("D=r"), "v9" -> List("D=g"))

    requiredParams.flatMap { case ((key: String, value: Seq[String])) =>
      for (v <- value) yield s"$key=$v"
    }.mkString("&")
  }

  def removeAds(document: Document): Document = {
    val elements = document.getElementById("sub-header")
    val ads = elements.children().toList.filterNot(e => e.attr("class") == "top-navigation twelve-col top-navigation-js")
    ads.foreach(_.remove())

    val comments = elements.childNodes().filter(node => node.nodeName().equals("#comment"))
    comments.foreach(_.remove())

    val promos = document.getElementById("promo")
    if(promos != null) promos.remove()

    document
  }

  def removeGoogleSearchBox(document: Document): Document = removeByClass(document, "top-search-box")
  def removeShareLinks(document: Document): Document = removeByClass(document, "share-links")

  def removeRelatedComponent(document: Document): Document = {
    val element = document.getElementById("related")
    if(element != null) element.remove()
    document
  }

  def removeScriptTags(document: Document): Document = {
    val element = document.getElementsByTag("script")
    if(element != null) element.remove()

    document
  }

  def removeIdentityUserDetailsTab(document: Document): Document = {
    val element = document.getElementsByClass("user-details")
    if(element != null) element.remove()
    document
  }

  def removeInitiallyOffPlaceHolderTags(document: Document): Document = {
    val element = document.getElementsByClass("initially-off")
    if(element != null) element.remove()
    document
  }

  def removeNoScriptTags(document: Document): Document = {
    val element = document.getElementsByTag("noscript")
    if(element != null) element.remove()
    document
  }

  private def removeByClass(document: Document, className: String): Document = {
    val element = document.getElementsByClass(className)
    if(element != null) element.remove()
    document
  }
}
