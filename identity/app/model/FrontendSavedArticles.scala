package model

import com.gu.identity.model.{SavedArticle, SavedArticles}
import org.joda.time.DateTime
import org.joda.time.format.{DateTimeFormat, ISODateTimeFormat}

/**
 * Created by nbennett on 27/03/15.
 */
class FrontendSavedArticles(version: String, articles: List[FrontendSavedArticle]) extends SavedArticles(version, articles) {

  val fmt = ISODateTimeFormat.dateTimeNoMillis()

  def this() = this(ISODateTimeFormat.dateTimeNoMillis().print(new DateTime()), List.empty)
  def contains(shortUrl: String) : Boolean = articles.exists( sa => sa.shortUrl == shortUrl)

  def addArticle(id: String, shortUrl: String) : SavedArticles = {

    val articleToSave = SavedArticle(id, shortUrl, new DateTime(), false )
    val timeStamp = fmt.print(new DateTime())

    articles match {
      case Nil =>
        SavedArticles(timeStamp, List(articleToSave))

      case _ => SavedArticles(version, articleToSave :: articles) }
  }
}

class FrontendSavedArticle(id: String, shortUrl: String, date: DateTime, read: Boolean) extends SavedArticle(id, shortUrl, date, read) {

  val fmt = DateTimeFormat.forPattern("EEEE d, HH:mm")

  lazy val href = "%s/%s".format(conf.Configuration.site.host, id)
  lazy val savedAt = fmt.print(date)
}
