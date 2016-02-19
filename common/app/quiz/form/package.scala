package quiz

import model.content.Quiz
import play.api.data.Form
import play.api.data.Forms._

package object form {

  case class Inputs(answerIds: List[String])

  val playForm = Form(
    mapping("answers" -> list(text))(Inputs.apply)(Inputs.unapply)
  )

  def checkUsersAnswers(inputs: Inputs, quiz: Quiz): QuizResults = {
    val validAnswers = inputs.answerIds.map(findQuizDataFor(_, quiz.content))

    QuizResults(quiz, validAnswers.flatten)
  }

  // Resolves an answer posted by the user to a Question-Answer pair defined by the content Atom.
  private def findQuizDataFor(answerId: String, quiz: QuizContent): Option[(Question, Answer)] = {
    val questionsWithAnswers = quiz.questions.flatMap( question => question.answers.map(question -> _))

    questionsWithAnswers.find {
      case (question, answer) => answer.id == answerId
    }
  }

  case class QuizResults(
    quiz: Quiz,
    entries: Seq[(Question, Answer)]
  ) {

    val isKnowledge = quiz.quizType == "knowledge"
    val isPersonality = quiz.quizType == "personality"

    def getAnswerFor(question: Question): Option[Answer] = entries
      .find { case (inputQuestion, _) => inputQuestion.id == question.id }
      .map(_._2)

    private val correctAnswers: Seq[Answer] = entries
      .filter { case (question, answer) => isCorrectAnswer(question, answer) }
      .map(_._2)

    val knowledgeScore: Int = correctAnswers.size

    val resultGroup: Option[ResultGroup] = {
      quiz.content.resultGroups
        .filter(knowledgeScore >= _.minScore)
        .sortBy(_.minScore)
        .lastOption
    }

    val knowledgeShareText: Option[String] = resultGroup.map(_.shareText)

    val resultBucket: Option[ResultBucket] = {

      // Find the bucket which the user responded to the most.
      val buckets: Seq[(String, Int)] = entries.flatMap { case (_, answer) =>
        answer.buckets
      } .groupBy(identity)
        .toList
        .map{ case (bucketId, occurrences) => bucketId -> occurrences.size }
        .sortBy(-_._2)

      buckets.headOption.flatMap{ case (bucketId, _) =>
        quiz.content.resultBuckets.find(_.id == bucketId)
      }
    }

    private def getCorrectAnswer(question: Question): Option[Answer] = {
      if (isPersonality) {
        question.answers.find(_.weight == 1)
      } else {
        None
      }
    }

    def isCorrectAnswer(inputQuestion: Question, inputAnswer: Answer): Boolean = {
      getCorrectAnswer(inputQuestion).exists(_.id == inputAnswer.id)
    }
  }
}