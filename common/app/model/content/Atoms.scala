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
          revealText = answer.revealText.flatMap(revealText => if (revealText != "") Some(revealText) else None),
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
      questions = questions,
      resultGroups = quiz.data.content.resultGroups.map(resultGroups => {
        resultGroups.groups.map(resultGroup => {
          ResultGroup(
            title = resultGroup.title,
            shareText = resultGroup.share,
            minScore = resultGroup.minScore
          )
        })
      })
    )
  }
}
final case class Question(
  text: String,
  answers: Seq[Answer])

final case class Answer(
  text: String,
  revealText: Option[String],
  weight: Int)

final case class ResultGroup(
  title: String,
  shareText: String,
  minScore: Int)

final case class Quiz(
  override val id: String,
  title: String,
  path: String,
  quizType: String,
  questions: Seq[Question],
  resultGroups: Option[Seq[ResultGroup]]
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
    QuizSubmissionResult(quiz = this, entries = validAnswers)
  }

  private def getCorrectAnswer(question: Question): Option[Answer] = {
    if (quizType == "knowledge") {
      question.answers.sortBy(_.weight).reverse.headOption
    } else {
      None
    }
  }

  def isCorrectAnswer(inputQuestion: Question, inputAnswer: Answer): Boolean = {
    getCorrectAnswer(inputQuestion).map(inputAnswer.equals(_)).exists(boolean => boolean)
  }
}

final case class QuizSubmissionResult(
  quiz: Quiz,
  entries: Seq[(Question, Answer)]
) {
  def getAnswerFor(question: Question): Option[Answer] = {
    entries
      .find { case (inputQuestion, _) => inputQuestion.equals(question) }
      .map(_._2)
  }

  val correctAnswers: Seq[Answer] =
    entries
      .filter { case (question, answer) => quiz.isCorrectAnswer(question, answer) }
      .map(_._2)

  val score: Int = correctAnswers.size

  val resultGroup: Option[ResultGroup] = {
    quiz.resultGroups.flatMap(resultGroups => {
      resultGroups
        .filter(score >= _.minScore)
        .sortBy(_.minScore)
        .lastOption
    })
  }
}

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
