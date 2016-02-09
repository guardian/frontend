
package object quiz {

  case class QuizContent(
    questions: Seq[Question],
    resultGroups: Seq[ResultGroup]
  )

  case class Question(
    text: String,
    answers: Seq[Answer])

  case class Answer(
    text: String,
    revealText: Option[String],
    weight: Int)

  case class ResultGroup(
    title: String,
    shareText: String,
    minScore: Int)

  def postUrl(quiz: model.content.Quiz) = s"/atom/quiz/${quiz.id}/${quiz.path}"
}