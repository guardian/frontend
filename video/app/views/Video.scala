package views

import model.Encoding
import play.api.templates.Html

object Video {

  def encodings(e: Seq[Encoding]): Html = Html(e.map { encoding =>
    """{file: "%s"}""".format(encoding.url)
  }.mkString(","))

  def encodings(e: Seq[Encoding], postfix: String): Html = encodings(e.filter(_.url.endsWith(postfix)))

}
