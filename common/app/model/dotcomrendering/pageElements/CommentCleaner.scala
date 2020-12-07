package model.dotcomrendering.pageElements

import org.jsoup.Jsoup

object CommentCleaner {
  def getBody(html: String): String = {
    Jsoup
      .parseBodyFragment(html)
      .getElementsByClass("d2-body")
      .html()
  }

  def getAvatar(html: String): String = {
    Jsoup
      .parseBodyFragment(html)
      .getElementsByClass("d2-avatar")
      .attr("src")
  }

  def getDateTime(html: String): String = {
    Jsoup
      .parseBodyFragment(html)
      .getElementsByClass("d2-datetime")
      .html()
  }
}
