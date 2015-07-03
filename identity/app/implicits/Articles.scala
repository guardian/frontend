package implicits

import com.gu.identity.model.{SavedArticles, SavedArticle}
import org.joda.time.DateTime
import org.joda.time.format.{ISODateTimeFormat, DateTimeFormat}

trait Articles {

  implicit class RichSavedArticle(savedArticle: SavedArticle) {
    val fmt = DateTimeFormat.forPattern("EEEE d, HH:mm")

    lazy val href = "%s/%s".format(conf.Configuration.site.host, savedArticle.id)
    lazy val savedAt = fmt.print(savedArticle.date)
    implicit val dateOrdering: Ordering[DateTime] = Ordering[Long] on { _.getMillis }
  }

  implicit class RichSavedArticles(savedArticles: SavedArticles) {
    val fmt = ISODateTimeFormat.dateTimeNoMillis()

    private val itemsPerPage = 10
    val newestFirst = savedArticles.articles.reverse

    val pages = newestFirst.grouped(itemsPerPage).toList

    val numPages = pages.length
    val totalSaved = savedArticles.articles.length
    def contains(shortUrl: String) : Boolean = savedArticles.articles.exists( sa => sa.shortUrl == shortUrl)

    def addArticle(id: String, shortUrl: String, platform: String): SavedArticles = {
      val date = new DateTime()
      val newArticle = SavedArticle(id, shortUrl, date, false, Some(platform))
      val timeStamp = fmt.print(date)

      savedArticles.articles match {
        case Nil =>
          SavedArticles(timeStamp, List(newArticle))

        case _ => SavedArticles(savedArticles.version, newArticle :: savedArticles.articles)
      }
    }

    def removeArticle(shortUrlToRemove: String) : SavedArticles = {
      val articles = shortUrlToRemove match {
        case "all" => List.empty
        case _ => savedArticles.articles.filterNot( article => article.shortUrl == shortUrlToRemove )
      }

      SavedArticles(savedArticles.version, articles)
    }

    //Deal with just having removed the only item on the last page
    def getPage(page: Int): List[SavedArticle] =
     pages.lift(Math.min(page, page-1)) orElse pages.lastOption getOrElse Nil
  }
}

object Articles extends Articles
