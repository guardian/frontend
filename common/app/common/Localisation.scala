package common

import common.editions.Us
import play.api.mvc.RequestHeader

object Translation {
  /* Helper functions for constructing translations */
  def toLower(tuple: (String, Seq[Translation])): (String, Seq[Translation]) = {
    val (from, translations) = tuple

    (from.toLowerCase, translations.map(t => t.copy(get = t.get.toLowerCase)))
  }

  def becomes(translations: (Edition, String)*): Seq[Translation] =
    translations.map((Translation.apply _).tupled)
}

case class Translation(
    edition: Edition,
    get: String,
)

/**
  * This is not a serious proposition for going forward. It's a temporary workaround to prepare us for US launch.
  *
 * If we're going to have editionalised tag names this ought to be fixed upstream in the tools, so that everyone is
  * able to make use of the data.
  */
object Localisation {
  import Translation._

  val caseInsensitive = Seq(
    ("Film", becomes((Us, "Movies"))),
    ("Football", becomes((Us, "Soccer"))),
  )

  val caseSensitive = Seq(
    ("in film", becomes((Us, "in movies"))),
    ("in football", becomes((Us, "in soccer"))),
    ("Football news, match reports and fixtures", becomes((Us, "Soccer news, match reports and fixtures"))),
  )

  val all = (caseInsensitive ++ caseInsensitive.map(toLower) ++ caseSensitive).toMap

  def localise(word: String, edition: Edition): String = {
    all.get(word) flatMap { translations =>
      translations.find(_.edition == edition).map(_.get)
    } getOrElse word
  }

  def apply(word: String)(implicit requestHeader: RequestHeader): String =
    localise(word, Edition(requestHeader))
}
