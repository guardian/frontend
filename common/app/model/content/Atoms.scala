package model.content

import com.gu.contentapi.client.model.{v1 => contentapi}
import play.api.data._
import play.api.data.Forms._

sealed trait Atom {
  def id: String
}

object Quiz {
  def make(path: String, quiz: contentapi.QuizAtom): Quiz = {
    val questions = quiz.data.content.questions.map { question =>
      val answers = question.answers.map { answer =>
        Answer(
          text = answer.answerText,
          reveal = answer.revealText,
          weight = answer.weight.toInt)
      }
      Question(
        text = question.questionText,
        answers = answers)
    }

    Quiz(
      id = quiz.id,
      path = path,
      questions = questions
      )
  }
}
final case class Question(
  text: String,
  answers: Seq[Answer])

final case class Answer(
  text: String,
  reveal: Option[String],
  weight: Int
)
final case class Quiz(
  override val id: String,
  path: String,
  questions: Seq[Question]
) extends Atom {

  val postUrl = s"/atom/quiz/$id/$path"
}

object QuizForm {
  case class UserAnswers(answers: List[String])
  val form = Form(
    mapping(
      "answers" -> list(text)
    )(UserAnswers.apply)(UserAnswers.unapply)
  )
}

object Atoms {
  def make(content: contentapi.Content): Option[Atoms] = {
    content.atoms.map { atoms =>
      Atoms(quizzes = atoms.quiz.map(Quiz.make(content.id, _)).toList)
    }
  }
}

final case class Atoms(
  quizzes: Seq[Quiz]
) {
  lazy val all: Seq[Atom] = quizzes
}