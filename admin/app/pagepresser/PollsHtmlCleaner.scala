package pagepresser

import org.jsoup.nodes.Document
import play.api.libs.json.Json
import play.api.libs.ws.WS
import scala.collection.JavaConversions._
import play.api.Play.current
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Await, Future}
import scala.concurrent.duration._

object PollDeserializer {
  implicit val jsonAnswers = Json.reads[Answer]
  implicit val jsonQuestions = Json.reads[Question]
  implicit val jsonPoll = Json.reads[Poll]
}

case class Poll(pollId: String, questions: List[Question])
case class Question(id: Int, count: Double, answers: List[Answer])
case class Answer(id: Int, question: Int, count: Double)

object PollsHtmlCleaner extends HtmlCleaner with implicits.WSRequests {

  override def canClean(document: Document): Boolean = {
    document.getElementsByAttribute("data-poll-url").nonEmpty
  }

  override def clean(document: Document) = {
    if(canClean(document)){
      pollClean(document)
    } else {
      document
    }
  }

  private def pollClean(document: Document): Document = {
    fetchAndPressPollResult(BasicHtmlCleaner.basicClean(document))
  }

  def fetchAndPressPollResult(document: Document): Document = {
    val pollUrl = document.getElementById("results-container").attr("data-poll-url")

    fetchPoll(pollUrl).foreach { poll =>

      poll.questions.foreach { question =>
        val mostAnsweredAnswerId = question.answers.tail.foldLeft(question.answers.head)((r, a) => if (r.count > a.count) r else a)

        for (answer <- question.answers) yield {
          val answerPercentage = Math.round(answer.count / question.count * 100)
          document.getElementById(s"a-${answer.id}").getElementsByClass("container").foreach { element =>
            element.tagName("div")
            element.attr("title", s"Votes cast: ${answer.count} ($answerPercentage%)")
            element.getElementsByClass("poll-result-bg").foreach { barResult =>
              if(answer.id == mostAnsweredAnswerId.id) barResult.attr("class", "poll-result-bg leader")
              barResult.attr("style", s"width: $answerPercentage%")
            }
            element.getElementsByClass("poll-result-figure").foreach { value =>
              if(answerPercentage > 70) value.attr("class", "poll-result-figure large")
              value.text(s"$answerPercentage%")
            }

          }
        }
      }
    }
    document

  }


  import PollDeserializer._
  def fetchPoll(url: String): Option[Poll] = {
    val result = Await.result(WS.url(url).getOKResponse(), 1.second)

    result.json.asOpt[Poll]

  }
}

