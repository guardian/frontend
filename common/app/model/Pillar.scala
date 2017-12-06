package model

import model.pressed.PressedStory
import com.gu.contentapi.client.model.v1.{Content => ApiContent}

case class Pillar(name: String) extends AnyVal {
  override def toString: String = name
}

object Pillar {
  def apply(contentApi: ApiContent): Option[Pillar] = contentApi.pillarName.map(Pillar(_))
  def apply(storyContent: Option[PressedStory]): Option[Pillar] = storyContent.flatMap(_.metadata.pillar)
}
