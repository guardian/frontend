package model.content

import com.gu.contentatom.thrift.atom.media.{Asset => AtomApiMediaAsset, MediaAtom => AtomApiMediaAtom}
import com.gu.contentatom.thrift.atom.timeline.{TimelineItem => TimelineApiItem}
import com.gu.contentatom.thrift.{
  AtomData,
  Atom => AtomApiAtom,
  Image => AtomApiImage,
  ImageAsset => AtomApiImageAsset,
  atom => atomapi,
}
import com.madgag.scala.collection.decorators.MapDecorator
import enumeratum._
import model.{ImageAsset, ImageMedia, ShareLinkMeta}
import org.apache.commons.lang3.time.DurationFormatUtils
import org.joda.time.format.DateTimeFormat
import org.joda.time.{DateTime, DateTimeZone, Duration}
import play.api.libs.json.{JsError, JsSuccess, Json}
import quiz._
import views.support.GoogleStructuredData

sealed trait Atom {
  def id: String
}

// ----------------------------------------
// AudioAtom
// ----------------------------------------

final case class AudioAtom(
    override val id: String,
    atom: AtomApiAtom,
    data: atomapi.audio.AudioAtom,
) extends Atom

object AudioAtom {
  def make(atom: AtomApiAtom): AudioAtom = {
    val audio = atom.data.asInstanceOf[AtomData.Audio].audio
    AudioAtom(atom.id, atom, audio)
  }
}

// ----------------------------------------
// ChartAtom
// ----------------------------------------

final case class ChartAtom(
    override val id: String,
    atom: AtomApiAtom,
    title: String,
    css: String,
    html: String,
    mainJS: Option[String],
) extends Atom

object ChartAtom {
  def make(atom: AtomApiAtom): ChartAtom = {
    ChartAtom(atom.id, atom, atom.title.getOrElse("Chart"), "", atom.defaultHtml, None)
  }
}

// ----------------------------------------
// CommonsDivisionAtom
// ----------------------------------------

final case class CommonsDivisionAtom(
    override val id: String,
    atom: AtomApiAtom,
    data: atomapi.commonsdivision.CommonsDivision,
) extends Atom

object CommonsDivisionAtom {
  def make(atom: AtomApiAtom): CommonsDivisionAtom = {
    val commonsdivision = atom.data.asInstanceOf[AtomData.CommonsDivision].commonsDivision
    CommonsDivisionAtom(atom.id, atom, commonsdivision)
  }
}

// ----------------------------------------
// ExplainerAtom
// ----------------------------------------

final case class ExplainerAtom(
    override val id: String,
    labels: Seq[String],
    title: String,
    body: String,
    atom: AtomApiAtom,
) extends Atom

object ExplainerAtom {
  def make(atom: AtomApiAtom): ExplainerAtom = {
    val explainer = atom.data.asInstanceOf[AtomData.Explainer].explainer
    ExplainerAtom(atom.id, explainer.tags.getOrElse(Nil).toSeq, explainer.title, explainer.body, atom)
  }
}

// ----------------------------------------
// InteractiveAtom
// ----------------------------------------

final case class InteractiveAtom(
    override val id: String,
    `type`: String,
    title: String,
    css: String,
    html: String,
    mainJS: Option[String],
    docData: Option[String],
    placeholderUrl: Option[String],
) extends Atom

object InteractiveAtom {
  def make(atom: AtomApiAtom): InteractiveAtom = {
    val interactive = atom.data.asInstanceOf[AtomData.Interactive].interactive
    InteractiveAtom(
      id = atom.id,
      `type` = interactive.`type`,
      title = interactive.title,
      css = interactive.css,
      html = interactive.html,
      mainJS = interactive.mainJS,
      docData = interactive.docData,
      placeholderUrl = interactive.placeholderUrl,
    )
  }
}

// ----------------------------------------
// GuideAtom
// ----------------------------------------

final case class GuideAtom(
    override val id: String,
    atom: AtomApiAtom,
    data: atomapi.guide.GuideAtom,
    image: Option[ImageMedia],
) extends Atom {
  def credit: Option[String] =
    for {
      img <- image
      asset <- img.allImages.headOption
      credit <- asset.credit
    } yield credit
}

object GuideAtom {
  def make(atom: AtomApiAtom): GuideAtom = {
    val guide = atom.data.asInstanceOf[AtomData.Guide].guide
    GuideAtom(atom.id, atom, guide, guide.guideImage.map(Atoms.atomImageToImageMedia))
  }
}

// ----------------------------------------
// MediaAtom
// ----------------------------------------

final case class MediaAtom(
    override val id: String,
    defaultHtml: String,
    assets: Seq[MediaAsset],
    title: String,
    duration: Option[Long],
    source: Option[String],
    posterImage: Option[ImageMedia],
    expired: Option[Boolean],
    activeVersion: Option[Long],
    channelId: Option[String],
) extends Atom {

  def activeAssets: Seq[MediaAsset] =
    activeVersion
      .map { version => assets.filter(_.version == version) }
      .getOrElse(assets)

  def isoDuration: Option[String] = {
    duration.map(d => new Duration(Duration.standardSeconds(d)).toString)
  }

  def formattedDuration: Option[String] = {
    duration.map { d =>
      val jodaDuration = new Duration(Duration.standardSeconds(d))
      val oneHour = new Duration(Duration.standardHours(1))
      val durationPattern = if (jodaDuration.isShorterThan(oneHour)) "mm:ss" else "HH:mm:ss"
      val formattedDuration = DurationFormatUtils.formatDuration(jodaDuration.getMillis, durationPattern, true)
      "^0".r.replaceFirstIn(formattedDuration, "") //strip leading zero
    }
  }
}

final case class MediaAsset(
    id: String,
    version: Long,
    platform: MediaAssetPlatform,
    mimeType: Option[String],
)

sealed trait MediaAssetPlatform extends EnumEntry

object MediaAtom extends common.GuLogging {

  def make(atom: AtomApiAtom): MediaAtom = {
    val id = atom.id
    val defaultHtml = atom.defaultHtml
    val mediaAtom = atom.data.asInstanceOf[AtomData.Media].media
    MediaAtom.mediaAtomMake(id, defaultHtml, mediaAtom)
  }

  def mediaAtomMake(id: String, defaultHtml: String, mediaAtom: AtomApiMediaAtom): MediaAtom = {
    val expired: Option[Boolean] = for {
      metadata <- mediaAtom.metadata
      expiryDate <- metadata.expiryDate
    } yield new DateTime(expiryDate).withZone(DateTimeZone.UTC).isBeforeNow

    MediaAtom(
      id = id,
      defaultHtml = defaultHtml,
      assets = mediaAtom.assets.map(mediaAssetMake).toSeq,
      title = mediaAtom.title,
      duration = mediaAtom.duration,
      source = mediaAtom.source,
      posterImage = mediaAtom.posterImage.map(imageMediaMake(_, mediaAtom.title)),
      expired = expired,
      activeVersion = mediaAtom.activeVersion,
      channelId = mediaAtom.metadata.flatMap(_.channelId),
    )
  }

  def imageMediaMake(capiImage: AtomApiImage, caption: String): ImageMedia = {
    ImageMedia(capiImage.assets.map(mediaImageAssetMake(_, caption)).toSeq)
  }

  def mediaAssetMake(mediaAsset: AtomApiMediaAsset): MediaAsset = {
    MediaAsset(
      id = mediaAsset.id,
      version = mediaAsset.version,
      platform = MediaAssetPlatform.withName(mediaAsset.platform.name),
      mimeType = mediaAsset.mimeType,
    )
  }

  def mediaImageAssetMake(mediaImage: AtomApiImageAsset, caption: String): ImageAsset = {
    ImageAsset(
      mediaType = "image",
      mimeType = mediaImage.mimeType,
      url = Some(mediaImage.file),
      fields = Map(
        "height" -> mediaImage.dimensions.map(_.height).map(_.toString),
        "width" -> mediaImage.dimensions.map(_.width).map(_.toString),
        "caption" -> Some(caption),
        "altText" -> Some(caption),
      ).collect { case (k, Some(v)) => (k, v) },
    )
  }
}

object MediaAssetPlatform extends Enum[MediaAssetPlatform] with PlayJsonEnum[MediaAssetPlatform] {

  val values = findValues

  case object Youtube extends MediaAssetPlatform
  case object Facebook extends MediaAssetPlatform
  case object Dailymotion extends MediaAssetPlatform
  case object Mainstream extends MediaAssetPlatform
  case object Url extends MediaAssetPlatform
}

// ----------------------------------------
// ProfileAtom
// ----------------------------------------

final case class ProfileAtom(
    override val id: String,
    atom: AtomApiAtom,
    data: atomapi.profile.ProfileAtom,
    image: Option[ImageMedia],
) extends Atom {
  def credit: Option[String] =
    for {
      img <- image
      asset <- img.allImages.headOption
      credit <- asset.credit
    } yield credit
}

object ProfileAtom {
  def make(atom: AtomApiAtom): ProfileAtom = {
    val profile = atom.data.asInstanceOf[AtomData.Profile].profile
    ProfileAtom(atom.id, atom, profile, profile.headshot.map(Atoms.atomImageToImageMedia))
  }
}

// ----------------------------------------
// QandaAtom
// ----------------------------------------

final case class QandaAtom(
    override val id: String,
    atom: AtomApiAtom,
    data: atomapi.qanda.QAndAAtom,
    image: Option[ImageMedia],
) extends Atom {
  def credit: Option[String] =
    for {
      img <- image
      asset <- img.allImages.headOption
      credit <- asset.credit
    } yield credit
}

object QandaAtom {
  def make(atom: AtomApiAtom): QandaAtom = {
    val qanda = atom.data.asInstanceOf[AtomData.Qanda].qanda
    QandaAtom(atom.id, atom, qanda, qanda.eventImage.map(Atoms.atomImageToImageMedia))
  }
}

// ----------------------------------------
// QuizAtom
// ----------------------------------------

final case class QuizAtom(
    override val id: String,
    title: String,
    path: String,
    quizType: String,
    content: QuizContent,
    revealAtEnd: Boolean,
    shareLinks: ShareLinkMeta,
) extends Atom

object QuizAtom extends common.GuLogging {

  implicit val assetFormat = Json.format[Asset]
  implicit val imageFormat = Json.format[Image]

  private def transformAssets(quizAsset: Option[atomapi.quiz.Asset]): Option[QuizImageMedia] =
    quizAsset.flatMap { asset =>
      val parseResult = Json.parse(asset.data).validate[Image]
      parseResult match {
        case parsed: JsSuccess[Image] =>
          val image = parsed.get
          val typeData = image.fields.mapV(value => value.toString) - "caption"

          val assets = for {
            plainAsset <- image.assets
          } yield {
            ImageAsset(
              fields = typeData ++ plainAsset.fields.mapV(value => value.toString),
              mediaType = plainAsset.assetType,
              mimeType = plainAsset.mimeType,
              url = plainAsset.secureUrl.orElse(plainAsset.url),
            )
          }
          if (assets.nonEmpty) Some(QuizImageMedia(ImageMedia(allImages = assets))) else None
        case error: JsError =>
          log.warn("Quiz atoms: asset json read errors: " + JsError.toFlatForm(error).toString())
          None
      }
    }

  def extractQuestions(quiz: atomapi.quiz.QuizAtom): Seq[Question] =
    quiz.content.questions.map { question =>
      val answers = question.answers.map { answer =>
        Answer(
          id = answer.id,
          text = answer.answerText,
          revealText = answer.revealText.flatMap(revealText => if (revealText != "") Some(revealText) else None),
          weight = answer.weight.toInt,
          buckets = answer.bucket.getOrElse(Nil).toSeq,
          imageMedia = transformAssets(answer.assets.headOption),
        )
      }

      Question(
        id = question.id,
        text = question.questionText,
        answers = answers.toSeq,
        imageMedia = transformAssets(question.assets.headOption),
      )
    }.toSeq

  def extractResultGroups(resultGroups: Option[com.gu.contentatom.thrift.atom.quiz.ResultGroups]): Seq[ResultGroup] =
    resultGroups
      .map(_.groups.map { resultGroup =>
        ResultGroup(
          id = resultGroup.id,
          title = resultGroup.title,
          shareText = resultGroup.share,
          minScore = resultGroup.minScore,
        )
      })
      .getOrElse(Nil)
      .toSeq

  def extractContent(questions: Seq[Question], quiz: atomapi.quiz.QuizAtom): QuizContent =
    QuizContent(
      questions = questions,
      resultGroups = extractResultGroups(quiz.content.resultGroups),
      resultBuckets = quiz.content.resultBuckets
        .map(resultBuckets => {
          resultBuckets.buckets.map(resultBucket => {
            ResultBucket(
              id = resultBucket.id,
              title = resultBucket.title,
              shareText = resultBucket.share,
              description = resultBucket.description,
            )
          })
        })
        .getOrElse(Nil)
        .toSeq,
    )

  def make(path: String, atom: AtomApiAtom, shareLinks: ShareLinkMeta): QuizAtom = {

    val quiz = atom.data.asInstanceOf[AtomData.Quiz].quiz
    val questions = extractQuestions(quiz)
    val content = extractContent(questions, quiz)

    QuizAtom(
      id = quiz.id,
      path = path,
      title = quiz.title,
      quizType = quiz.quizType,
      content = content,
      revealAtEnd = quiz.revealAtEnd,
      shareLinks = shareLinks,
    )
  }
}

// ----------------------------------------
// RecipeAtom
// ----------------------------------------

final case class RecipeAtom(
    override val id: String,
    atom: AtomApiAtom,
    data: atomapi.recipe.RecipeAtom,
) extends Atom

object RecipeAtom {
  def make(atom: AtomApiAtom): RecipeAtom = RecipeAtom(atom.id, atom, atom.data.asInstanceOf[AtomData.Recipe].recipe)

  def picture(r: RecipeAtom): Option[model.ImageMedia] = {
    r.data.images.headOption.map { img => MediaAtom.imageMediaMake(img, "") }
  }

  def totalTime(recipe: RecipeAtom): Option[Int] = {
    (recipe.data.time.preparation ++ recipe.data.time.cooking).map(_.toInt).reduceOption(_ + _)
  }

  def yieldServingType(serves: com.gu.contentatom.thrift.atom.recipe.Serves): String = {
    serves.`type` match {
      case "serves"   => "servings"
      case "makes"    => s"${serves.unit.getOrElse("")}"
      case "quantity" => "portions"
    }
  }

  def formatServingValue(serves: com.gu.contentatom.thrift.atom.recipe.Serves): String = {
    val portions = if (serves.from != serves.to) s"from ${serves.from} to ${serves.to} " else s"${serves.from} "
    portions ++ yieldServingType(serves)
  }

  def formatIngredientValues(ingredients: Seq[com.gu.contentatom.thrift.atom.recipe.Ingredient]): Seq[String] = {
    ingredients.map(formatIngredientValue)
  }

  def formatIngredientValue(ingredient: com.gu.contentatom.thrift.atom.recipe.Ingredient): String = {
    val q = ingredient.quantity
      .map(formatQuantity)
      .orElse(ingredient.quantityRange.map(range => s"${formatQuantity(range.from)}-${formatQuantity(range.to)}"))
      .getOrElse("")
    val comment = ingredient.comment.fold("")(c => s", $c")
    s"""${q} ${formatUnit(ingredient.unit.getOrElse(""))} ${ingredient.item}${comment}"""
  }

  private def formatUnit(unit: String): String = {
    unit match {
      case "dsp"  => "dessert spoon"
      case "tsp"  => "teaspoon"
      case "tbsp" => "tablespoon"
      case _      => unit
    }
  }

  private def formatQuantity(q: Double): String = {
    q match {
      case qty if qty == qty.toInt => qty.toInt.toString
      case 0.75                    => "¾"
      case 0.5                     => "½"
      case 0.25                    => "¼"
      case 0.125                   => "⅛"
      case _                       => q.toString
    }
  }
}

// ----------------------------------------
// ReviewAtom
// ----------------------------------------

final case class ReviewAtom(
    override val id: String,
    atom: AtomApiAtom,
    data: atomapi.review.ReviewAtom,
) extends Atom

object ReviewAtom {
  def make(atom: AtomApiAtom): ReviewAtom = ReviewAtom(atom.id, atom, atom.data.asInstanceOf[AtomData.Review].review)

  def getLargestImageUrl(images: Seq[com.gu.contentatom.thrift.Image]): Option[String] = {
    for {
      image <- images.headOption
      media = model.content.MediaAtom.imageMediaMake(image, "")
      url <- GoogleStructuredData.bestSrcFor(media)
    } yield url
  }
}

// ----------------------------------------
// TimelineAtom
// ----------------------------------------

final case class TimelineAtom(
    override val id: String,
    atom: AtomApiAtom,
    data: atomapi.timeline.TimelineAtom,
    events: Seq[TimelineItem],
) extends Atom

final case class TimelineItem(
    title: String,
    date: DateTime,
    body: Option[String],
    toDate: Option[Long],
)

object TimelineAtom {
  def make(atom: AtomApiAtom): TimelineAtom =
    TimelineAtom(
      atom.id,
      atom,
      atom.data.asInstanceOf[AtomData.Timeline].timeline,
      events = atom.data.asInstanceOf[AtomData.Timeline].timeline.events.toSeq map TimelineItem.make,
    )

  def renderFormattedDate(date: Long, format: Option[String]): String = {
    format match {
      case Some("month-year") => DateTimeFormat.forPattern("MMMM yyyy").print(date)
      case Some("year")       => DateTimeFormat.forPattern("yyyy").print(date)
      case _                  => DateTimeFormat.forPattern("d MMMM yyyy").print(date)
    }
  }
}

object TimelineItem {
  def make(item: TimelineApiItem): TimelineItem =
    TimelineItem(
      item.title,
      new DateTime(item.date),
      item.body,
      item.toDate,
    )
}
