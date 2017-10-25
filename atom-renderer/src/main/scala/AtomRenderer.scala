package com.gu.contentatom.renderer

import com.gu.contentatom.thrift.{Atom, AtomData, AtomType}
import com.gu.contentatom.thrift.atom.cta.CTAAtom
import com.gu.contentatom.thrift.atom.explainer.ExplainerAtom
import com.gu.contentatom.thrift.atom.guide.GuideAtom
import com.gu.contentatom.thrift.atom.interactive.InteractiveAtom
import com.gu.contentatom.thrift.atom.media.MediaAtom
import com.gu.contentatom.thrift.atom.profile.ProfileAtom
import com.gu.contentatom.thrift.atom.qanda.QAndAAtom
import com.gu.contentatom.thrift.atom.quiz.QuizAtom
import com.gu.contentatom.thrift.atom.recipe.RecipeAtom
import com.gu.contentatom.thrift.atom.review.ReviewAtom
import com.gu.contentatom.thrift.atom.storyquestions.StoryQuestionsAtom
import com.gu.contentatom.thrift.atom.timeline.TimelineAtom
import io.circe._
import io.circe.parser._
import renderers.{Renderings, Rendering}

import utils.CSSMinifier

trait AtomRenderer {
  protected val renderings: Renderings
  import renderings._
  import json._

  type HTML = String
  type CSS = Option[String]
  type JS = Option[String]

  def getHTML[A](atom: Atom, data: A)(implicit reader: Rendering[A]): HTML =
    reader.html(atom, data).toString
  
  def getHTML(atom: Atom): HTML = atom.data match {
    case AtomData.Cta(data)            => getHTML(atom, data)
    case AtomData.Explainer(data)      => getHTML(atom, data)
    case AtomData.Guide(data)          => getHTML(atom, data)
    case AtomData.Interactive(data)    => getHTML(atom, data)
    case AtomData.Media(data)          => getHTML(atom, data)
    case AtomData.Profile (data)       => getHTML(atom, data)
    case AtomData.Qanda(data)          => getHTML(atom, data)
    case AtomData.Quiz(data)           => getHTML(atom, data)
    case AtomData.Recipe(data)         => getHTML(atom, data)
    case AtomData.Review(data)         => getHTML(atom, data)
    case AtomData.Storyquestions(data) => getHTML(atom, data)
    case AtomData.Timeline(data)       => getHTML(atom, data)
    case _                             => atom.defaultHtml
  }

  def getHTML(json: Json): Option[HTML] = json.as[Atom] match {
    case Left(_) => None
    case Right(atom) => Some(getHTML(atom))
  }

  def getHTML(json: String): Option[HTML] =
    parse(json).right.toOption.flatMap(getHTML)

  def getCSS[A](implicit reader: Rendering[A]): CSS =
    reader.css.map(_.toString).map(CSSMinifier.apply)

  def getJS[A](implicit reader: Rendering[A]): JS =
    reader.js.map(_.toString)
  
  def getCSS(atomType: AtomType): CSS = atomType match {
    case AtomType.Cta            => getCSS[CTAAtom]
    case AtomType.Explainer      => getCSS[ExplainerAtom]
    case AtomType.Guide          => getCSS[GuideAtom]
    case AtomType.Interactive    => getCSS[InteractiveAtom]
    case AtomType.Media          => getCSS[MediaAtom]
    case AtomType.Profile        => getCSS[ProfileAtom]
    case AtomType.Qanda          => getCSS[QAndAAtom]
    case AtomType.Quiz           => getCSS[QuizAtom]
    case AtomType.Recipe         => getCSS[RecipeAtom]
    case AtomType.Review         => getCSS[ReviewAtom]
    case AtomType.Storyquestions => getCSS[StoryQuestionsAtom]
    case AtomType.Timeline       => getCSS[TimelineAtom]
    case _                => None
  }

  def getCSS(atomTypes: Seq[AtomType]): Seq[String] =
    atomTypes.distinct.map(getCSS).flatten
  
  def getJS(atomType: AtomType): JS = atomType match {
    case AtomType.Cta            => getJS[CTAAtom]
    case AtomType.Explainer      => getJS[ExplainerAtom]
    case AtomType.Guide          => getJS[GuideAtom]
    case AtomType.Interactive    => getJS[InteractiveAtom]
    case AtomType.Media          => getJS[MediaAtom]
    case AtomType.Profile        => getJS[ProfileAtom]
    case AtomType.Qanda          => getJS[QAndAAtom]
    case AtomType.Quiz           => getJS[QuizAtom]
    case AtomType.Recipe         => getJS[RecipeAtom]
    case AtomType.Review         => getJS[ReviewAtom]
    case AtomType.Storyquestions => getJS[StoryQuestionsAtom]
    case AtomType.Timeline       => getJS[TimelineAtom]
    case _                => None
  }

  def getJS(atomTypes: Seq[AtomType]): Seq[String] =
    atomTypes.distinct.map(getJS).flatten

  def getAllCSS: Seq[CSS] = Seq[CSS](
    getCSS[CTAAtom],
    getCSS[ExplainerAtom],
    getCSS[GuideAtom],
    getCSS[InteractiveAtom],
    getCSS[MediaAtom],
    getCSS[ProfileAtom],
    getCSS[QAndAAtom],
    getCSS[QuizAtom],
    getCSS[RecipeAtom],
    getCSS[ReviewAtom],
    getCSS[StoryQuestionsAtom],
    getCSS[TimelineAtom]
  )

  def getAllJS: Seq[JS] = Seq[JS](
    getJS[CTAAtom],
    getJS[ExplainerAtom],
    getJS[GuideAtom],
    getJS[InteractiveAtom],
    getJS[MediaAtom],
    getJS[ProfileAtom],
    getJS[QAndAAtom],
    getJS[QuizAtom],
    getJS[RecipeAtom],
    getJS[ReviewAtom],
    getJS[StoryQuestionsAtom],
    getJS[TimelineAtom]
  )
}

object ArticleAtomRenderer extends AtomRenderer {
  val renderings = renderers.ArticleRenderings
}

object DefaultAtomRenderer extends AtomRenderer {
  val renderings = renderers.DefaultRenderings
}
