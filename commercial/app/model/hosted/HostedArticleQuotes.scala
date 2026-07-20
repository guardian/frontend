package model.hosted

import org.jsoup.Jsoup
import play.api.mvc.RequestHeader
import views.html.fragments.inlineSvg

object HostedArticleQuotes {

  def prepareQuotes(html: String)(implicit request: RequestHeader): String = {

    val doc = Jsoup.parseBodyFragment(html)

    def insertQuoteIcon(): Unit = {
      val quote = doc.select("blockquote>p")
      quote.append(inlineSvg("hosted-quote", "icon").toString)
    }

    insertQuoteIcon()

    doc.body.html()
  }
}
