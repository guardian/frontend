package model.content

import com.gu.contentapi.client.model.{v1 => contentapi}
import model.content.QuizForm.UserAnswer
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
      title = quiz.data.title,
      quizType = quiz.data.quizType,
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
  title: String,
  path: String,
  quizType: String,
  questions: Seq[Question]
) extends Atom {

  val postUrl = s"/atom/quiz/$id/$path"

  // Resolves an answer posted by the user to a Question-Answer pair defined by the content Atom.
  private def findQuizDataFor(userInput: UserAnswer): Option[(Question, Answer)] = {
    val quizQuestion = questions.zipWithIndex.find {
      case (question, questionIndex) => questionIndex == userInput.questionIndex
    }

    val quizAnswer = quizQuestion.flatMap { case (question, _) =>
      question.answers.zipWithIndex.find {
        case (answer, answerIndex) => answer.text == userInput.answerText && answerIndex == userInput.answerIndex
      }
    }

    for {
      (q, _) <- quizQuestion
      (a, _) <- quizAnswer
    } yield { (q,a) }
  }

  def submitAnswers(userAnswers: QuizForm.UserAnswers): QuizSubmissionResult = {
    val validAnswers = userAnswers.parsed.flatMap(findQuizDataFor)
    QuizSubmissionResult(validAnswers)
  }

  private def getCorrectAnswer(question: Question): Option[Answer] = {
    if (quizType == "knowledge") {
      question.answers.sortBy(_.weight).reverse.headOption
    } else {
      None
    }
  }

  def isCorrectAnswer(inputQuestion: Question, inputAnswer: Answer): Boolean = {
    getCorrectAnswer(inputQuestion).map(inputAnswer.equals(_)).getOrElse(false)
  }
}

final case class QuizSubmissionResult(
  entries: Seq[(Question, Answer)]
)

object QuizForm {

  // each answer is expected in the format "Q1##A2##Answer Text"
  private val answerFormat = """Q(\d*)##A(\d*)##(.*)""".r

  case class UserAnswers(answers: List[String]) {
    val parsed: Seq[UserAnswer] = {
      val validAnswers = for { answer <- answers } yield {
        answer match {
          case answerFormat(questionIndex, answerIndex, answerText) => Some(UserAnswer(
            questionIndex.toInt,
            answerIndex.toInt,
            answerText))
          case _ => None
        }
      }
      validAnswers.flatten
    }
  }
  case class UserAnswer(
    questionIndex: Int,
    answerIndex: Int,
    answerText: String
  )
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