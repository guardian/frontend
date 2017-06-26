package model.content

import com.gu.contentapi.client.model.v1.TagType
import com.gu.contentapi.client.model.{v1 => contentapi}
import com.gu.contentatom.thrift.atom.media.{Asset => AtomApiMediaAsset, MediaAtom => AtomApiMediaAtom}
import com.gu.contentatom.thrift.{AtomData, Atom => AtomApiAtom, Image => AtomApiImage, ImageAsset => AtomApiImageAsset, atom => atomapi}
import enumeratum._
import model.{EndSlateComponents, ImageAsset, ImageMedia}
import org.apache.commons.lang3.time.DurationFormatUtils
import org.joda.time.{DateTime, DateTimeZone, Duration}
import play.api.libs.json.{JsError, JsSuccess, Json}
import quiz._
import views.support.{GoogleStructuredData, ImgSrc}

final case class Atoms(
  quizzes: Seq[Quiz],
  media: Seq[MediaAtom],
  interactives: Seq[InteractiveAtom],
  recipes: Seq[RecipeAtom],
  reviews: Seq[ReviewAtom],
  storyquestions: Seq[StoryQuestionsAtom],
  explainers: Seq[ExplainerAtom],
  qandas: Seq[QandaAtom],
  guides: Seq[GuideAtom],
  profiles: Seq[ProfileAtom],
  timelines: Seq[TimelineAtom]
) {
  val all: Seq[Atom] = quizzes ++ media ++ interactives ++ recipes ++ reviews ++ storyquestions ++ explainers ++ qandas ++ guides ++ profiles ++ timelines
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
  posterImage: Option[ImageMedia],
  endSlatePath: Option[String],
  expired: Option[Boolean],
  activeVersion: Option[Long]
) extends Atom {

  def activeAssets: Seq[MediaAsset] = activeVersion
    .map { version => assets.filter(_.version == version) }
    .getOrElse(assets)

  def isoDuration: Option[String] = {
    duration.map(d => new Duration(Duration.standardSeconds(d)).toString)
  }

  def formattedDuration: Option[String] = {
    duration.map { d =>
      val jodaDuration = new Duration(Duration.standardSeconds(d))
      val oneHour = new Duration(Duration.standardHours(1))
      val durationPattern = if(jodaDuration.isShorterThan(oneHour)) "mm:ss" else "HH:mm:ss"
      val formattedDuration = DurationFormatUtils.formatDuration(jodaDuration.getMillis, durationPattern, true)
      "^0".r.replaceFirstIn(formattedDuration, "") //strip leading zero
    }
  }
}


sealed trait MediaAssetPlatform extends EnumEntry

object MediaAssetPlatform extends Enum[MediaAssetPlatform] with PlayJsonEnum[MediaAssetPlatform] {

  val values = findValues

  case object Youtube extends MediaAssetPlatform
  case object Facebook extends MediaAssetPlatform
  case object Dailymotion extends MediaAssetPlatform
  case object Mainstream extends MediaAssetPlatform
  case object Url extends MediaAssetPlatform
}

sealed trait MediaWrapper extends EnumEntry

object MediaWrapper extends Enum[MediaWrapper] with PlayJsonEnum[MediaWrapper] {
  val values = findValues

  case object MainMedia extends MediaWrapper
  case object ImmersiveMainMedia extends MediaWrapper
  case object EmbedPage extends MediaWrapper
  case object VideoContainer extends MediaWrapper
}

final case class MediaAsset(
  id: String,
  version: Long,
  platform: MediaAssetPlatform,
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

final case class InteractiveAtom(
  override val id: String,
  `type`: String,
  title: String,
  css: String,
  html: String,
  mainJS: Option[String],
  docData: Option[String]
) extends Atom

final case class RecipeAtom(
  override val id: String,
  atom: AtomApiAtom,
  data: atomapi.recipe.RecipeAtom
) extends Atom

final case class ReviewAtom(
  override val id: String,
  atom: AtomApiAtom,
  data: atomapi.review.ReviewAtom
) extends Atom

final case class StoryQuestionsAtom(
  override val id: String,
  atom: AtomApiAtom,
  data: atomapi.storyquestions.StoryQuestionsAtom
) extends Atom

final case class ExplainerAtom(
  override val id: String,
  labels: Seq[String],
  title: String,
  body: String
) extends Atom

final case class QandaAtom(
  override val id: String,
  atom: AtomApiAtom,
  data: atomapi.qanda.QAndAAtom
) extends Atom

final case class GuideAtom(
  override val id: String,
  atom: AtomApiAtom,
  data: atomapi.guide.GuideAtom
) extends Atom

final case class ProfileAtom(
  override val id: String,
  atom: AtomApiAtom,
  data: atomapi.profile.ProfileAtom
) extends Atom

final case class TimelineAtom(
  override val id: String,
  atom: AtomApiAtom,
  data: atomapi.timeline.TimelineAtom
) extends Atom


object Atoms extends common.Logging {
  def extract[T](atoms: Option[Seq[AtomApiAtom]], extractFn: AtomApiAtom => T): Seq[T] = {
    try {
      atoms.getOrElse(Nil).map(extractFn)
    } catch {
      case e: Exception =>
        logException(e)
        Nil
    }
  }

  def make(content: contentapi.Content): Option[Atoms] = {
    content.atoms.map { atoms =>
      val quizzes = extract(atoms.quizzes, atom => { Quiz.make(content.id, atom) })

      val media = extract(atoms.media, atom => {
        val endSlatePath = EndSlateComponents(
          sectionId = content.sectionId.getOrElse(""),
          shortUrl = content.fields.flatMap(_.shortUrl).getOrElse(""),
          seriesId = content.tags.find(_.`type` == TagType.Series).map(_.id))
          .toUriPath
        MediaAtom.make(atom, Some(endSlatePath))
      })

      val interactives = extract(atoms.interactives, atom => { InteractiveAtom.make(atom) })

      val recipes = extract(atoms.recipes, atom => { RecipeAtom.make(atom) })

      val reviews = extract(atoms.reviews, atom => { ReviewAtom.make(atom) })

      val storyquestions = extract(atoms.storyquestions, atom => { StoryQuestionsAtom.make(atom) })

      val explainers = extract(atoms.explainers, atom => { ExplainerAtom.make(atom) })

      val qandas = extract(atoms.qandas, atom => {QandaAtom.make(atom)})

      val guides = extract(atoms.guides, atom => {GuideAtom.make(atom)})

      val profiles = extract(atoms.profiles, atom => {ProfileAtom.make(atom)})

      val timelines = extract(atoms.timelines, atom => {TimelineAtom.make(atom)})

      Atoms(
        quizzes = quizzes,
        media = media,
        interactives = interactives,
        recipes = recipes,
        reviews = reviews,
        storyquestions = storyquestions,
        explainers = explainers,
        qandas = qandas,
        guides = guides,
        profiles = profiles,
        timelines = timelines
      )
    }
  }
}


object MediaAtom extends common.Logging {

  def make(atom: AtomApiAtom, endSlatePath: Option[String]): MediaAtom = {
    val id = atom.id
    val defaultHtml = atom.defaultHtml
    val mediaAtom = atom.data.asInstanceOf[AtomData.Media].media
    MediaAtom.mediaAtomMake(id, defaultHtml, mediaAtom, endSlatePath)
  }

  def mediaAtomMake(id: String, defaultHtml: String, mediaAtom: AtomApiMediaAtom, endSlatePath: Option[String]): MediaAtom = {
    val expired: Option[Boolean] = for {
      metadata <- mediaAtom.metadata
      expiryDate <- metadata.expiryDate
    } yield new DateTime(expiryDate).withZone(DateTimeZone.UTC).isBeforeNow

    MediaAtom(
      id = id,
      defaultHtml = defaultHtml,
      assets = mediaAtom.assets.map(mediaAssetMake),
      title = mediaAtom.title,
      duration = mediaAtom.duration,
      source = mediaAtom.source,
      posterImage = mediaAtom.posterImage.map(imageMediaMake(_, mediaAtom.title)),
      endSlatePath = endSlatePath,
      expired = expired,
      activeVersion = mediaAtom.activeVersion
    )
  }

  def imageMediaMake(capiImage: AtomApiImage, caption: String): ImageMedia = {
    ImageMedia(capiImage.assets.map(mediaImageAssetMake(_, caption)))
  }

  def mediaAssetMake(mediaAsset: AtomApiMediaAsset): MediaAsset = {
    MediaAsset(
      id = mediaAsset.id,
      version = mediaAsset.version,
      platform = MediaAssetPlatform.withName(mediaAsset.platform.name),
      mimeType = mediaAsset.mimeType)
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
        "altText" -> Some(caption)
      ).collect{ case(k, Some(v)) => (k,v) }
    )
  }
}

object Quiz extends common.Logging {

  implicit val assetFormat = Json.format[Asset]
  implicit val imageFormat = Json.format[Image]

  private def transformAssets(quizAsset: Option[atomapi.quiz.Asset]): Option[QuizImageMedia] = quizAsset.flatMap { asset =>
    val parseResult = Json.parse(asset.data).validate[Image]
    parseResult match {
      case parsed: JsSuccess[Image] =>
        val image = parsed.get
        val typeData = image.fields.mapValues(value => value.toString) - "caption"

        val assets = for {
          plainAsset <- image.assets
        } yield {
         ImageAsset(
          fields = typeData ++ plainAsset.fields.mapValues(value => value.toString),
          mediaType = plainAsset.assetType,
          mimeType = plainAsset.mimeType,
          url = plainAsset.secureUrl.orElse(plainAsset.url))
        }
        if (assets.nonEmpty) Some(QuizImageMedia(ImageMedia(allImages = assets))) else None
      case error: JsError =>
        log.warn("Quiz atoms: asset json read errors: " + JsError.toFlatForm(error).toString())
        None
    }
  }



  def make(path: String, atom: AtomApiAtom): Quiz = {

    val quiz = atom.data.asInstanceOf[AtomData.Quiz].quiz
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
      docData = interactive.docData
    )
  }
}


object RecipeAtom {
  def make(atom: AtomApiAtom): RecipeAtom = RecipeAtom(atom.id, atom, atom.data.asInstanceOf[AtomData.Recipe].recipe)

  def picture(r: RecipeAtom): Option[model.ImageMedia] = {
    r.data.images.headOption.map{ img => MediaAtom.imageMediaMake(img, "")}
  }

  def totalTime(recipe: RecipeAtom): Option[Int] = {
    (recipe.data.time.preparation ++ recipe.data.time.cooking).map(_.toInt).reduceOption(_ + _)
  }

  def yieldServingType(serves: com.gu.contentatom.thrift.atom.recipe.Serves): String = {
    serves.`type` match {
      case "serves" => "servings"
      case "makes" => s"${serves.unit.getOrElse("")}"
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
      .orElse(ingredient.quantityRange.map(range => s"${formatQuantity(range.from)}-${formatQuantity(range.to)}" ))
      .getOrElse("")
    val comment = ingredient.comment.fold("")(c => s", $c")
    s"""${q} ${formatUnit(ingredient.unit.getOrElse(""))} ${ingredient.item}${comment}"""
  }

  private def formatUnit(unit: String): String = {
    unit match {
      case "dsp" => "dessert spoon"
      case "tsp" => "teaspoon"
      case "tbsp" => "tablespoon"
      case _ => unit
    }
  }

  private def formatQuantity(q: Double): String = {
    q match {
      case qty if qty == qty.toInt => qty.toInt.toString
      case 0.75 => "¾"
      case 0.5 => "½"
      case 0.25 => "¼"
      case 0.125 => "⅛"
      case _ => q.toString
    }
  }
}

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

object StoryQuestionsAtom {
  def make(atom: AtomApiAtom): StoryQuestionsAtom = StoryQuestionsAtom(atom.id, atom, atom.data.asInstanceOf[AtomData.Storyquestions].storyquestions)
}

object ExplainerAtom {
  def make(atom: AtomApiAtom): ExplainerAtom = {
    val explainer = atom.data.asInstanceOf[AtomData.Explainer].explainer
    ExplainerAtom(atom.id, explainer.tags.getOrElse(Nil), explainer.title, explainer.body)
  }
}

object QandaAtom {
  def make(atom: AtomApiAtom): QandaAtom = QandaAtom(atom.id, atom, atom.data.asInstanceOf[AtomData.Qanda].qanda)
}

object GuideAtom {
  def make(atom: AtomApiAtom): GuideAtom = GuideAtom(atom.id, atom, atom.data.asInstanceOf[AtomData.Guide].guide)
}

object ProfileAtom {
  def make(atom: AtomApiAtom): ProfileAtom = ProfileAtom(atom.id, atom, atom.data.asInstanceOf[AtomData.Profile].profile)
}

object TimelineAtom {
  def make(atom: AtomApiAtom): TimelineAtom = TimelineAtom(atom.id, atom, atom.data.asInstanceOf[AtomData.Timeline].timeline)
}

