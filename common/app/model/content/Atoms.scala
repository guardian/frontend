package model.content

import com.gu.contentapi.client.model.{v1 => contentapi}
import com.gu.contentatom.thrift.{AtomData, atom => atomapi}
import model.{ImageAsset, ImageMedia}
import com.gu.contentatom.thrift.atom.media.{Asset => AtomApiMediaAsset}
import com.gu.contentatom.thrift.atom.media.{MediaAtom => AtomApiMediaAtom}
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import play.api.libs.json.{JsError, JsSuccess, Json}
import quiz._

final case class Atoms(
  quizzes: Seq[Quiz],
  media: Seq[MediaAtom]
) {
  val all: Seq[Atom] = quizzes ++ media

}

sealed trait Atom {
  def id: String
}

final case class MediaAtom(
  override val id: String,
  defaultHtml: String,
  assets: Seq[MediaAsset],
  title: String,
  duration: Option[Long],
  source: Option[String],
  posterUrl: Option[String]
) extends Atom


final case class MediaAsset(
  id: String,
  version: Long,
  platform: String,
  mimeType: Option[String]
)


final case class Quiz(
  override val id: String,
  title: String,
  path: String,
  quizType: String,
  content: QuizContent,
  revealAtEnd: Boolean
) extends Atom





object Atoms extends common.Logging {
  def make(content: contentapi.Content): Option[Atoms] = {
    content.atoms.map { atoms =>
      val quizzes: Seq[atomapi.quiz.QuizAtom] = try {
        atoms.quizzes.getOrElse(Nil).map(atom => {
          atom.data.asInstanceOf[AtomData.Quiz].quiz
        })
      } catch {
        case e: Exception =>
          logException(e)
          Nil
      }
      val media: Seq[MediaAtom] = try {
        atoms.media.getOrElse(Nil).map(atom => {
          val id = atom.id
          val defaultHtml = atom.defaultHtml
          val mediaAtom = atom.data.asInstanceOf[AtomData.Media].media
          MediaAtom.mediaAtomMake(id, defaultHtml, mediaAtom)
        })
      } catch {
        case e: Exception =>
          logException(e)
          Nil
      }


      Atoms(quizzes = quizzes.map(Quiz.make(content.id, _)), media = media)
    }
  }
}


object MediaAtom extends common.Logging {

  def mediaAtomMake(id: String, defaultHtml: String, mediaAtom: AtomApiMediaAtom): MediaAtom =
    MediaAtom(
      id = id,
      defaultHtml = defaultHtml,
      assets = mediaAtom.assets.map(mediaAssetMake),
      title = mediaAtom.title,
      duration = mediaAtom.duration,
      source = mediaAtom.source,
      posterUrl = mediaAtom.posterUrl)

  def mediaAssetMake(mediaAsset: AtomApiMediaAsset): MediaAsset =
  {
    MediaAsset(
      id = mediaAsset.id,
      version = mediaAsset.version,
      platform = mediaAsset.platform.toString,
      mimeType = mediaAsset.mimeType)
  }

}

object Quiz extends common.Logging {

  implicit val assetFormat = Json.format[Asset]
  implicit val imageFormat = Json.format[Image]

  private def transformAssets(quizAsset: Option[atomapi.quiz.Asset]): Option[QuizImageMedia] = quizAsset.flatMap { asset =>
    val parseResult = Json.parse(asset.data).validate[Image]
    parseResult match {
      case parsed: JsSuccess[Image] => {
        val image = parsed.get
        val typeData = image.fields.mapValues(value => value.toString) - "caption"

        val assets = for {
          plainAsset <- image.assets
        } yield {
         ImageAsset(
          index = 0,
          fields = typeData ++ plainAsset.fields.mapValues(value => value.toString),
          mediaType = plainAsset.assetType,
          mimeType = plainAsset.mimeType,
          url = plainAsset.secureUrl.orElse(plainAsset.url))
        }
        if (assets.nonEmpty) Some(QuizImageMedia(ImageMedia(allImages = assets))) else None
      }
      case error: JsError => {
        log.warn("Quiz atoms: asset json read errors: " + JsError.toFlatForm(error).toString())
        None
      }
    }
  }



  def make(path: String, quiz: atomapi.quiz.QuizAtom): Quiz = {
    val questions = quiz.content.questions.map { question =>
      val answers = question.answers.map { answer =>
        Answer(
          id = answer.id,
          text = answer.answerText,
          revealText = answer.revealText.flatMap(revealText => if (revealText != "") Some(revealText) else None),
          weight = answer.weight.toInt,
          buckets = answer.bucket.getOrElse(Nil),
          imageMedia = transformAssets(answer.assets.headOption))
      }

      Question(
        id = question.id,
        text = question.questionText,
        answers = answers,
        imageMedia = transformAssets(question.assets.headOption))
    }

    val content = QuizContent(
      questions = questions,
      resultGroups = quiz.content.resultGroups.map(resultGroups => {
        resultGroups.groups.map(resultGroup => {
          ResultGroup(
            id = resultGroup.id,
            title = resultGroup.title,
            shareText = resultGroup.share,
            minScore = resultGroup.minScore
          )
        })
      }).getOrElse(Nil),
      resultBuckets = quiz.content.resultBuckets.map(resultBuckets =>{
        resultBuckets.buckets.map(resultBucket => {
          ResultBucket(
            id = resultBucket.id,
            title = resultBucket.title,
            shareText = resultBucket.share,
            description = resultBucket.description
          )
        })
      }).getOrElse(Nil)
    )

    Quiz(
      id = quiz.id,
      path = path,
      title = quiz.title,
      quizType = quiz.quizType,
      content = content,
      revealAtEnd = quiz.revealAtEnd
    )
  }
}
