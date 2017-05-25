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
      case (_, answer) => answer.id == answerId
    }
  }

  // Find the correct answer for a given question.
  private[quiz] def getCorrectAnswer(question: Question): Option[Answer] = {
    question.answers.find(_.weight == 1)
  }

  // Returns true of inputAnswer is the correct answer of inputQuestion.
  def isCorrectAnswer(inputQuestion: Question, inputAnswer: Answer): Option[Boolean] = {
    getCorrectAnswer(inputQuestion).map(_.id == inputAnswer.id)
  }

  // Returns true if each answer in this question has images.
  def hasImages(question: Question): Boolean = {
    question.answers.forall(answer => answer.imageMedia.nonEmpty)
  }

  case class QuizResults(
    quiz: Quiz,
    entries: Seq[(Question, Answer)]
  ) {

    val isKnowledge = quiz.quizType == "knowledge"
    val isPersonality = quiz.quizType == "personality"

    // Find the user's answer to the question specified.
    def getAnswerFor(question: Question): Option[Answer] = entries
      .find { case (inputQuestion, _) => inputQuestion.id == question.id }
      .map(_._2)

    // Access to the list of answers correctly given by the user.
    private val correctAnswers: Seq[Answer] = entries
      .filter { case (question, answer) => isCorrectAnswer(question, answer).getOrElse(false) }
      .map(_._2)

    // The user's final score, the correct number of answers they have given.
    val knowledgeScore: Int = correctAnswers.size

    // The user's final result group, the highest applicable score group they are a member of. For knowledge quizzes.
    val resultGroup: Option[ResultGroup] = {
      quiz.content.resultGroups
        .filter(knowledgeScore >= _.minScore)
        .sortBy(_.minScore)
        .lastOption
    }

    val knowledgeShareText: Option[String] = resultGroup.map(_.shareText)

    // The user's final result bucket, the bucket that the user has responded with the most. For personality quizzes.
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

  }
}