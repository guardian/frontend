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
    val itemsPerPage = 5

    val pages = savedArticles.articles match {
      case Nil => List.empty
      case _ => savedArticles.articles.grouped(4).toList
    }

    lazy val numPages = pages.length

    lazy val totalSaved = savedArticles.articles.length
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

    def removeArticle(shortUrlToRemove: String) : SavedArticles = {
      val articles = shortUrlToRemove match {
        case "all" => List.empty
        case _ => savedArticles.articles.filterNot( article => article.shortUrl == shortUrlToRemove )
      }

      SavedArticles(savedArticles.version, articles)
    }

    def prevPage( currentPage: Int ) : Option[Int] =  (currentPage > 1) match {
      case true => Option(currentPage - 1)
      case _ => None
    }

    def nextPage( currentPage: Int ) : Option[Int] = {
      val nextPage = currentPage + 1
      nextPage > pages.length match {
        case true => None
        case _ => Some(nextPage)
      }
    }

    //Deal with just having removed the only item on the last page
    def getPage(page: Int): List[SavedArticle] = pages match {
      case Nil => List.empty
      case _ => page >= pages.length match {
        case true => pages.last
        case _ =>pages(page - 1)
      }

    }
  }
}

object Articles extends Articles
