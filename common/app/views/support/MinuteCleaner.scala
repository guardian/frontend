package views.support

import org.jsoup.nodes.{ Element, Document }
import scala.collection.JavaConversions._

case class TimestampCleaner(article: model.Article) extends HtmlCleaner {
  override def clean(document: Document): Document = {
    // US Minute articles use liveblog blocks but we don't want to show timestamps
    if (article.isUSMinute) document.getElementsByClass("published-time").foreach(_.remove)
    document
  }
}

case class MinuteCleaner(article: model.Article) extends HtmlCleaner {
  /**
    * Associate child classes (keys) with those to add to the parent (values).
    */
  val ParentClasses = Map(
    "element-video" -> "block--embed block--video",
    "element-twitter" -> "block--embed block--tweet",
    "block-title" -> "has-title",
    "quoted" -> "block--quote",
    "element--inline" -> "background-image",
    "element--thumbnail" -> "bottom-image"
  )

  /**
    * Classes to strip from block children.
    */
  val strippable = Seq("element--thumbnail")

  override def clean(document: Document): Document = {
    if (article.isUSMinute) {
      document.getElementsByClass("block").foreach { block =>
        val allElements = block.getAllElements
        val elementImage = block.getElementsByClass("element-image")
        val elementTitle = block.getElementsByClass("block-title")
        val blockElementDiv = block.getElementsByClass("block-elements")

        block.addClass("block--minute-article")
        block.removeClass("block")
        block.getElementsByClass("block-share").remove()

        // Re-order Elements
        elementImage.remove()
        elementTitle.remove()
        blockElementDiv.after(elementImage.toString)
        blockElementDiv.prepend(elementTitle.toString)

        ParentClasses.foldLeft(Set(): Set[String]) { case (classes, (childClass, parentClass)) =>
          if (allElements.exists(_.hasClass(childClass))) classes + parentClass
          else classes
        } foreach(block.addClass)

        allElements.foreach(el => strippable.foreach(el.removeClass))
      }
    }

    document
  }
}
