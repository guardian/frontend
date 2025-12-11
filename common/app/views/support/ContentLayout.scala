package views.support

import model._
import org.jsoup.Jsoup

object ContentLayout {
  def showBottomSocialButtons(content: model.ContentType): Boolean = {
    content match {
      case l: Article if l.isLiveBlog => true
      case a: Article                 =>
        val bodyLength = Jsoup.parseBodyFragment(a.content.fields.body).select("> *").text().length
        val mainMediaOffset = if (a.elements.hasMainPicture || a.elements.hasMainVideo || a.hasVideoAtTop) 700 else 0
        bodyLength + mainMediaOffset > 1200
      case _: ImageContent => false
      case _: Audio        => false
      case _: Video        => false
      case _: Gallery      => false
      case _               => true
    }
  }
}
