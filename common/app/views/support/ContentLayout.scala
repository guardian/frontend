package views.support

import model._
import org.jsoup.Jsoup

object ContentLayout {
  implicit class ContentLayout(content: model.ContentType) {
    def showBottomSocialButtons: Boolean = {
      content match {
        case l: Article if l.isLiveBlog => true
        case a: Article =>
          val bodyLength = Jsoup.parseBodyFragment(a.content.fields.body).select("> *").text().length
          val mainMediaOffset = if(a.elements.hasMainPicture || a.elements.hasMainVideo || a.hasVideoAtTop) 700 else 0
          bodyLength + mainMediaOffset > 1200
        case _: ImageContent => false
        case _: Audio => false
        case _: Video => false
        case _: Gallery => false
        case _ => true
      }
    }

    def tagTone: Option[String] = {
      content match {
        case l: Article if l.isLiveBlog => Some("live")
        case _: Audio => Some("media")
        case _: Video => Some("media")
        case _: Gallery => Some("media")
        case _: ImageContent => Some("media")
        case _ => None
      }
    }
  }
}
