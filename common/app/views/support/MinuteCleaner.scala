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

  override def clean(document: Document): Document = {
    if (article.isUSMinute) {
      document.getElementsByClass("block").foreach { block =>
        block.addClass("block--minutearticle")
        block.removeClass("block")

        ParentClasses.foldLeft(Set(): Set[String]) { case (classes, (childClass, parentClass)) =>
          if (block.getAllElements.exists(_.hasClass(childClass))) classes + parentClass
          else classes
        } foreach(block.addClass)
      }
    }

    document
  }
}
