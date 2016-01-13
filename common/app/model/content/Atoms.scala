package model.content

import com.gu.contentapi.client.model.{v1 => contentapi}
import conf.Configuration

sealed trait Atom {
  def id: String
}

object Quiz {
  def make(quiz: contentapi.QuizAtom): Quiz = {
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
  questions: Seq[Question]
) extends Atom {

  val postUrl = s"/atom/quiz/$id"
}

object Atoms {
  def make(content: contentapi.Content): Option[Atoms] = {
    content.atoms.map { atoms =>
      Atoms(quizzes = atoms.quiz.map(Quiz.make).toList)
    }
  }
}

final case class Atoms(
  quizzes: Seq[Quiz]
) {
  lazy val all: Seq[Atom] = quizzes
}