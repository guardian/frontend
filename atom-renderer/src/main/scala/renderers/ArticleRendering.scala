package com.gu.contentatom.renderer
package renderers

import com.gu.contentatom.thrift.Atom
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

import play.twirl.api.Html

import twirl.Css

import utils.LoadFromClasspath

trait ArticleRendering[A] extends Rendering[A] {
  def html(atom: Atom, data: A) = html_impl(atom, data)
  def css = Some(css_impl())
  def js = js_impl()

  def html_impl: (Atom, A) => Html
  def css_impl: () => Css
  def js_impl: () => Option[String]
}

object ArticleRenderings extends Renderings {
  import config._
  
  val ctaRendering = new ArticleRendering[CTAAtom] {
    val html_impl = (atom, data) => cta.article.html.index(atom, data)
    val css_impl = () => cta.article.css.index()
    val js_impl = () => LoadFromClasspath("/cta/article/index.js")
  }

  val explainerRendering = new ArticleRendering[ExplainerAtom] {
    val html_impl = (atom, data) => explainer.article.html.index(atom, data)
    val css_impl = () => explainer.article.css.index()
    val js_impl = () => LoadFromClasspath("/explainer/article/index.js")
  }

  val guideRendering = new ArticleRendering[GuideAtom] {
    val html_impl = (atom, data) => guide.article.html.index(atom, data)
    val css_impl = () => guide.article.css.index()
    val js_impl = () => LoadFromClasspath("/guide/article/guide.js")
  }

  val interactiveRendering = new ArticleRendering[InteractiveAtom] {
    val html_impl = (atom, data) => interactive.article.html.index(atom, data)
    val css_impl = () => interactive.article.css.index()
    val js_impl = () => LoadFromClasspath("/interactive/article/index.js")
  }

  val mediaRendering = new ArticleRendering[MediaAtom] {
    val html_impl = (atom, data) => media.article.html.index(atom, data)
    val css_impl = () => media.article.css.index()
    val js_impl = () => LoadFromClasspath("/media/article/index.js")
  }

  val profileRendering = new ArticleRendering[ProfileAtom] {
    val html_impl = (atom, data) => profile.article.html.index(atom, data)
    val css_impl = () => profile.article.css.index()
    val js_impl = () => LoadFromClasspath("/profile/article/profile.js")
  }

  val qandaRendering = new ArticleRendering[QAndAAtom] {
    val html_impl = (atom, data) => qanda.article.html.index(atom, data)
    val css_impl = () => qanda.article.css.index()
    val js_impl = () => LoadFromClasspath("/qanda/article/qanda.js")
  }

  val quizRendering = new ArticleRendering[QuizAtom] {
    val html_impl = (atom, data) => quiz.article.html.index(atom, data)
    val css_impl = () => quiz.article.css.index()
    val js_impl = () => LoadFromClasspath("/quiz/article/index.js")
  }

  val recipeRendering = new ArticleRendering[RecipeAtom] {
    val html_impl = (atom, data) => recipe.article.html.index(atom, data)
    val css_impl = () => recipe.article.css.index()
    val js_impl = () => LoadFromClasspath("/recipe/article/index.js")
  }

  val reviewRendering = new ArticleRendering[ReviewAtom] {
    val html_impl = (atom, data) => review.article.html.index(atom, data)
    val css_impl = () => review.article.css.index()
    val js_impl = () => LoadFromClasspath("/review/article/index.js")
  }

  val storyquestionsRendering = new ArticleRendering[StoryQuestionsAtom] {
    val html_impl = (atom, data) => storyquestions.article.html.index(atom, data)
    val css_impl = () => storyquestions.article.css.index()
    val js_impl = () => LoadFromClasspath("/storyquestions/article/index.js")
  }

  val timelineRendering = new ArticleRendering[TimelineAtom] {
    val html_impl = (atom, data) => timeline.article.html.index(atom, data)
    val css_impl = () => timeline.article.css.index()
    val js_impl = () => LoadFromClasspath("/timeline/article/timeline.js")
  }
}
