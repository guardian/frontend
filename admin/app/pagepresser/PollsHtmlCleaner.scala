package pagepresser

import org.jsoup.nodes.Document
import play.api.libs.json.Json
import play.api.libs.ws.WS
import scala.collection.JavaConversions._
import play.api.Play.current
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object PollDeserializer {
  implicit val jsonAnswers = Json.reads[Answer]
  implicit val jsonQuestions = Json.reads[Question]
  implicit val jsonPoll = Json.reads[Poll]
}

case class Poll(pollId: String, questions: List[Question])
case class Question(id: Int, count: Int, answers: List[Answer])
case class Answer(id: Int, question: Int, count: Int)

object PollsHtmlCleaner extends HtmlCleaner with implicits.WSRequests {

  override def clean(document: Document): Document = {
    super.clean(document)
    fetchAndPressPollResult(document)
  }

  def fetchAndPressPollResult(document: Document): Document = {
    val resultsContainer = document.getElementById("results-container")
    val pollUrl = resultsContainer.attr("data-poll-url")

    fetchPoll(pollUrl).map { pollOpt =>
      for {
        poll <- pollOpt
      } yield {
        poll.questions.foreach { question =>
          val questionElement = resultsContainer.getElementById(s"q-${question.id}")
          val mostAnsweredAnswerId = question.answers.tail.foldLeft(question.answers.head)((r, a) => if (r.count > a.count) r else a)

          for (answer <- question.answers) {
            val answerElement = questionElement.getElementById(s"a-${answer.id}")
            val answerPercentage = Math.round(answer.count / question.count * 100)
            answerElement.getElementsByClass("container").headOption.foreach { element =>
              element.getElementsByClass("container").headOption.foreach { e =>
                e.attr("title", s"Votes cast: ${answer.count} ($answerPercentage%)")
              }
            }
          }
        }
      }
    }

    document

  }


  import PollDeserializer._
  def fetchPoll(url: String): Future[Option[Poll]] = {
    val jsonF = WS.url(url).withRequestTimeout(2000).getOKResponse().map(_.json)
    for (json <- jsonF) yield json.asOpt[Poll]

  }
}

