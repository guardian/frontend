package quiz

import model.content.Quiz
import play.api.data.Form
import play.api.data.Forms._

package object form {

  case class Inputs(answers: List[String])

  val playForm = Form(
    mapping("answers" -> list(text))(Inputs.apply)(Inputs.unapply)
  )

  // each answer is expected in the format "Q1##A2##Answer Text"
  private val answerFormat = """Q(\d*)##A(\d*)##(.*)""".r

  def checkUsersAnswers(inputs: Inputs, quiz: Quiz): QuizResults = {
    val validAnswers: Seq[(Int, Int, String)] = (for { answer <- inputs.answers } yield {
      answer match {
        case answerFormat(questionIndex, answerIndex, answerText) => Some(
          questionIndex.toInt,
          answerIndex.toInt,
          answerText)
        case _ => None
      }
    }).flatten

    val entries = validAnswers.flatMap {
      case (questionIndex: Int, answerIndex: Int, answerText: String) => {
        findQuizDataFor(questionIndex, answerIndex, answerText, quiz.content)
      }
    }

    QuizResults(quiz, entries)
  }

  // Resolves an answer posted by the user to a Question-Answer pair defined by the content Atom.
  private def findQuizDataFor(questionIndex: Int, answerIndex: Int, answerText: String, quiz: QuizContent): Option[(Question, Answer)] = {
    val quizQuestion = quiz.questions.zipWithIndex.find {
      case (question, questionIndex) => questionIndex == questionIndex
    }

    val quizAnswer = quizQuestion.flatMap { case (question, _) =>
      question.answers.zipWithIndex.find {
        case (answer, answerIndex) => answer.text == answerText && answerIndex == answerIndex
      }
    }

    for {
      (q, _) <- quizQuestion
      (a, _) <- quizAnswer
    } yield { (q,a) }
  }

  case class QuizResults(
    quiz: Quiz,
    entries: Seq[(Question, Answer)]
  ) {
    def getAnswerFor(question: Question): Option[Answer] = entries
      .find { case (inputQuestion, _) => inputQuestion.equals(question) }
      .map(_._2)

    val correctAnswers: Seq[Answer] = entries
      .filter { case (question, answer) => isCorrectAnswer(question, answer) }
      .map(_._2)

    val score: Int = correctAnswers.size

    val resultGroup: Option[ResultGroup] = {
      quiz.content.resultGroups
        .filter(score >= _.minScore)
        .sortBy(_.minScore)
        .lastOption
    }

    private def getCorrectAnswer(question: Question): Option[Answer] = {
      if (quiz.quizType == "knowledge") {
        question.answers.sortBy(_.weight).reverse.headOption
      } else {
        None
      }
    }

    def isCorrectAnswer(inputQuestion: Question, inputAnswer: Answer): Boolean = {
      getCorrectAnswer(inputQuestion).map(inputAnswer.equals(_)).exists(boolean => boolean)
    }
  }
}