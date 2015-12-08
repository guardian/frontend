package views.support

import model._
import org.jsoup.Jsoup

object ContentLayout {
  implicit class ContentLayout(content: model.ContentType) {
    def showBottomSocialButtons: Boolean = {
      content match {
        case l: Article if l.isLiveBlog => true
        case a: Article => {
          val bodyLength = Jsoup.parseBodyFragment(a.content.fields.body).select("> *").text().length
          val mainMediaOffset = if(a.elements.hasMainPicture || a.elements.hasMainVideo || a.hasVideoAtTop) 700 else 0
          bodyLength + mainMediaOffset > 1200
        }
        case i: ImageContent => false
        case a: Audio => false
        case v: Video => false
        case g: Gallery => false
        case _ => true
      }
    }

    def tagTone: Option[String] = {
      content match {
        case l: Article if l.isLiveBlog => Some("live")
        case a: Audio => Some("media")
        case v: Video => Some("media")
        case g: Gallery => Some("media")
        case i: ImageContent => Some("media")
        case _ => None
      }
    }
  }
}
