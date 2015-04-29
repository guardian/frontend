package implicits

import com.gu.identity.model.{SavedArticles, SavedArticle}
import org.joda.time.DateTime
import org.joda.time.format.{ISODateTimeFormat, DateTimeFormat}

trait Articles {

  implicit class RichSavedArticle(savedArticle: SavedArticle) {
    val fmt = DateTimeFormat.forPattern("EEEE d, HH:mm")

    lazy val href = "%s/%s".format(conf.Configuration.site.host, savedArticle.id)
    lazy val savedAt = fmt.print(savedArticle.date)
  }

  implicit class RichSavedArticles(savedArticles: SavedArticles) {
    val fmt = ISODateTimeFormat.dateTimeNoMillis()


    def newestFirst = savedArticles.articles.reverse
    def contains(shortUrl: String) : Boolean = savedArticles.articles.exists( sa => sa.shortUrl == shortUrl)

    def addArticle(id: String, shortUrl: String): SavedArticles = {
      val date = new DateTime()
      val newArticle = SavedArticle(id, shortUrl, date, false)
      val timeStamp = fmt.print(date)

      savedArticles.articles match {
        case Nil =>
          SavedArticles(timeStamp, List(newArticle))

        case _ => SavedArticles(savedArticles.version, newArticle :: savedArticles.articles)
      }
    }

    def removeArticle(shortUrl: String) : SavedArticles
        = SavedArticles(savedArticles.version, savedArticles.articles.filterNot{ article => article.shortUrl == shortUrl })

  }
}

object Articles extends Articles
