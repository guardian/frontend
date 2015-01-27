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

    def submetaBreakpoint: Option[String] = {
      content match {
        case a: LiveBlog => None
        case a: Article if !a.hasSupporting => Some("leftcol")
        case v: Video if v.standfirst.getOrElse("").length > 350 => Some("leftcol")
        case a: Audio if a.body.getOrElse("").length > 800 => Some("leftcol")
        case i: ImageContent if i.mainPicture.flatMap(_.largestEditorialCrop).exists(crop => crop.height / crop.width.toFloat > 0.5) => Some("wide")
        case g: Gallery => Some("leftcol")
        case _ => None
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
