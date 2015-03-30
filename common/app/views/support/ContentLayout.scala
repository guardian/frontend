package views.support

import model._
import org.jsoup.Jsoup

object ContentLayout {
  implicit class ContentLayout(content: model.Content) {
    def showBottomSocialButtons: Boolean = {
      content match {
        case l: LiveBlog => true
        case a: Article => {
          val bodyLength = Jsoup.parseBodyFragment(a.body).select("> *").text().length
          val mainMediaOffset = if(a.hasMainPicture || a.hasMainVideo || a.hasVideoAtTop) 700 else 0
          bodyLength + mainMediaOffset > 1200
        }
        case i: ImageContent => false
        case m: Media => false
        case g: Gallery => false
        case _ => true
      }
    }

    def tagTone: Option[String] = {
      content match {
        case l: LiveBlog => Some(l.visualTone)
        case m: Media => Some("media")
        case g: Gallery => Some("media")
        case i: ImageContent => Some("media")
        case _ => None
      }
    }
  }
}
