package model.content

import com.gu.contentapi.client.model.{v1 => contentapi}
import com.gu.contentatom.renderer.{ArticleConfiguration, AudioSettings}
import com.gu.contentatom.thrift.{Atom => AtomApiAtom}
import conf.Configuration
import model.{ImageAsset, ImageMedia, ShareLinkMeta}

final case class Atoms(
    quizzes: Seq[QuizAtom],
    media: Seq[MediaAtom],
    interactives: Seq[InteractiveAtom],
    recipes: Seq[RecipeAtom],
    reviews: Seq[ReviewAtom],
    explainers: Seq[ExplainerAtom],
    qandas: Seq[QandaAtom],
    guides: Seq[GuideAtom],
    profiles: Seq[ProfileAtom],
    timelines: Seq[TimelineAtom],
    commonsdivisions: Seq[CommonsDivisionAtom],
    audios: Seq[AudioAtom],
    charts: Seq[ChartAtom],
) {
  val all: Seq[Atom] =
    quizzes ++ media ++ interactives ++ recipes ++ reviews ++ explainers ++ qandas ++ guides ++ profiles ++ timelines ++ commonsdivisions ++ audios ++ charts

  def atomTypes: Map[String, Boolean] =
    Map(
      "guide" -> !guides.isEmpty,
      "qanda" -> !qandas.isEmpty,
      "profile" -> !profiles.isEmpty,
      "timeline" -> !timelines.isEmpty,
      "explainer" -> !explainers.isEmpty,
      "commonsdivision" -> !commonsdivisions.isEmpty,
      "audio" -> !audios.isEmpty,
      "chart" -> !charts.isEmpty,
    )
}

object Atoms extends common.GuLogging {

  def articleConfig(isAdFree: Boolean = false, useAcast: Boolean = false): ArticleConfiguration = {
    val audioSettings = AudioSettings(externalAdvertising = !isAdFree && useAcast)
    val artConf = ArticleConfiguration(
      ajaxUrl = Configuration.ajax.url,
      audioSettings = audioSettings,
      commonsdivisionConfiguration = ArticleConfiguration.CommonsdivisionConfiguration(showMps = true),
    )
    artConf
  }

  def extract[T](
      atoms: Option[Seq[AtomApiAtom]],
      extractFn: AtomApiAtom => T,
  ): Seq[T] = {
    try {
      atoms.getOrElse(Nil).map(extractFn)
    } catch {
      case e: Exception =>
        logException(e)
        Nil
    }
  }

  def make(content: contentapi.Content, pageShares: ShareLinkMeta = ShareLinkMeta(Nil, Nil)): Option[Atoms] = {
    content.atoms.map { atoms =>
      val quizzes = extract(atoms.quizzes.map(_.toSeq), atom => { QuizAtom.make(content.id, atom, pageShares) })

      val media = extract(
        atoms.media.map(_.toSeq),
        atom => {
          MediaAtom.make(atom)
        },
      )

      val interactives = extract(atoms.interactives.map(_.toSeq), atom => { InteractiveAtom.make(atom) })

      val recipes = extract(atoms.recipes.map(_.toSeq), atom => { RecipeAtom.make(atom) })

      val reviews = extract(atoms.reviews.map(_.toSeq), atom => { ReviewAtom.make(atom) })

      val explainers = extract(atoms.explainers.map(_.toSeq), atom => { ExplainerAtom.make(atom) })

      val qandas = extract(atoms.qandas.map(_.toSeq), atom => { QandaAtom.make(atom) })

      val guides = extract(atoms.guides.map(_.toSeq), atom => { GuideAtom.make(atom) })

      val profiles = extract(atoms.profiles.map(_.toSeq), atom => { ProfileAtom.make(atom) })

      val timelines = extract(atoms.timelines.map(_.toSeq), atom => { TimelineAtom.make(atom) })

      val commonsdivisions = extract(atoms.commonsdivisions.map(_.toSeq), atom => { CommonsDivisionAtom.make(atom) })

      val audios = extract(atoms.audios.map(_.toSeq), atom => { AudioAtom.make(atom) })

      val charts = extract(atoms.charts.map(_.toSeq), ChartAtom.make)

      Atoms(
        quizzes = quizzes,
        media = media,
        interactives = interactives,
        recipes = recipes,
        reviews = reviews,
        explainers = explainers,
        qandas = qandas,
        guides = guides,
        profiles = profiles,
        timelines = timelines,
        commonsdivisions = commonsdivisions,
        audios = audios,
        charts = charts,
      )
    }
  }

  def atomImageToImageMedia(atomImage: com.gu.contentatom.thrift.Image): ImageMedia = {
    val imageAssets: Seq[ImageAsset] = atomImage.assets.flatMap { asset =>
      asset.dimensions.map { dims =>
        ImageAsset(
          fields = Map(
            "width" -> dims.width.toString,
            "height" -> dims.height.toString,
          ) ++ asset.credit.map("credit" -> _),
          mediaType = "image",
          mimeType = asset.mimeType,
          url = Some(asset.file),
        )
      }
    }.toSeq

    ImageMedia(imageAssets)
  }
}
