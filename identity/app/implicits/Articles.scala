package implicits

import com.gu.identity.model.SavedArticle
import org.joda.time.format.DateTimeFormat

trait Articles {

  implicit class RichSavedArticle(savedArticle: SavedArticle) {
    val fmt = DateTimeFormat.forPattern("EEEE d, HH:mm")

    lazy val href = "%s/%s".format(conf.Configuration.site.host, savedArticle.id)
    lazy val savedAt = fmt.print(savedArticle.date)
  }
}

object Articles extends Articles
