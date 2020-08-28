import play.api.libs.json.JsValue

package object quiz {

  case class QuizContent(questions: Seq[Question], resultGroups: Seq[ResultGroup], resultBuckets: Seq[ResultBucket])

  case class Question(id: String, text: String, answers: Seq[Answer], imageMedia: Option[QuizImageMedia])

  case class Answer(
      id: String,
      text: String,
      revealText: Option[String],
      weight: Int,
      buckets: Seq[String],
      imageMedia: Option[QuizImageMedia],
  )

  case class QuizImageMedia(
      imageMedia: model.ImageMedia,
  ) {
    val imageClasses: Option[(model.ImageAsset, String)] = {
      imageMedia.masterImage.map { master =>
        val orientationClass = master.orientation match {
          case views.support.Portrait => "img--portrait"
          case _                      => "img--landscape"
        }
        (master, orientationClass)
      }
    }
  }

  case class ResultGroup(id: String, title: String, shareText: String, minScore: Int)

  case class ResultBucket(
      id: String,
      title: String,
      shareText: String,
      description: String,
  )

  // Currently, CAPI are returning opaque json strings as assets for quiz atoms.
  // These json strings are immediately transformed into ImageMedia objects.
  case class Image(
      elementType: String,
      fields: Map[String, JsValue],
      assets: Seq[Asset],
  )

  case class Asset(
      assetType: String,
      url: Option[String],
      secureUrl: Option[String],
      mimeType: Option[String],
      fields: Map[String, JsValue],
  )

  def postUrl(quiz: model.content.QuizAtom): String = s"/atom/quiz/${quiz.id}/${quiz.path}"
}
