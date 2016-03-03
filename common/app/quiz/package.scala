
package object quiz {

  case class QuizContent(
    questions: Seq[Question],
    resultGroups: Seq[ResultGroup],
    resultBuckets: Seq[ResultBucket])

  case class Question(
    id: String,
    text: String,
    answers: Seq[Answer])

  case class Answer(
    id: String,
    text: String,
    revealText: Option[String],
    weight: Int,
    buckets: Seq[String])

  case class ResultGroup(
    id: String,
    title: String,
    shareText: String,
    minScore: Int)

  case class ResultBucket(
    id: String,
    title: String,
    shareText: String,
    description: String
  )

  def postUrl(quiz: model.content.Quiz) = s"/atom/quiz/${quiz.id}/${quiz.path}"
}