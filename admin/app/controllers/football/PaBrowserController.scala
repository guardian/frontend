package controllers.admin

import play.api._
import play.api.mvc._
import play.api.Play.current
import services.football.{GetPaClient, Client}
import common.{Logging, ExecutionContexts}
import org.joda.time.DateMidnight
import java.net.URLDecoder
import scala.concurrent.Future
import scala.language.postfixOps


object PaBrowserController extends Controller with ExecutionContexts with GetPaClient {

  def browserSubstitution() = Authenticated { implicit request =>
    val submission = request.body.asFormUrlEncoded.getOrElse { throw new Exception("Could not read POST submission") }
    val query = getOneOrFail(submission, "query")
    val replacements = """(\{.*?\})""".r.findAllIn(query).toList.filter("{apiKey}"!=)
    val replacedQuery = replacements.foldLeft(query){ case (replacingQuery, replacement) =>
      val fieldName = replacement.dropWhile('{' ==).dropWhile('*' ==).takeWhile('}' !=)
      if (replacement.startsWith("{*")) {
        getOne(submission, fieldName).map { newValue =>
          replacingQuery.replace(replacement, newValue)
        }.getOrElse(replacingQuery.replace("/" + replacement, ""))
      }
      else {
        replacingQuery.replace(replacement, getOneOrFail(submission, fieldName))
      }
    }
    SeeOther("/admin/football/browser/%s".format(replacedQuery.dropWhile('/' ==)))
  }

  def browse = Authenticated { implicit request =>
    Ok(views.html.football.browse())
  }

  def browser(query: String) = Authenticated.async { implicit request =>
    val replacedQuery = URLDecoder.decode(query, "UTF-8").replace("{apiKey}", client.apiKey)
    client.get("/" + replacedQuery).map{ content =>
      val response = Ok(content)
      if (replacedQuery.contains("/image/")) response.as("image/png")
      else response.as("application/xml")
    }
  }

  private def getOneOrFail(submission: Map[String, scala.Seq[String]], key: String): String = {
    URLDecoder.decode(submission.get(key).getOrElse { throw new Exception("Missing required submission parameter, %s".format(key)) }.head, "UTF-8")
  }

  private def getOne(submission: Map[String, scala.Seq[String]], key: String): Option[String] = {
    submission.get(key).map(values => URLDecoder.decode(values.head, "UTF-8"))
  }
}
