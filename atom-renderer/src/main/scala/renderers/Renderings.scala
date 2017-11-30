package com.gu.contentatom.renderer
package renderers

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

trait Renderings {
  implicit val ctaRendering: Rendering[CTAAtom]
  implicit val explainerRendering: Rendering[ExplainerAtom]
  implicit val guideRendering: Rendering[GuideAtom]
  implicit val interactiveRendering: Rendering[InteractiveAtom]
  implicit val mediaRendering: Rendering[MediaAtom]
  implicit val profileRendering: Rendering[ProfileAtom]
  implicit val qandaRendering: Rendering[QAndAAtom]
  implicit val quizRendering: Rendering[QuizAtom]
  implicit val recipeRendering: Rendering[RecipeAtom]
  implicit val reviewRendering: Rendering[ReviewAtom]
  implicit val storyquestionsRendering: Rendering[StoryQuestionsAtom]
  implicit val timelineRendering: Rendering[TimelineAtom]
}
