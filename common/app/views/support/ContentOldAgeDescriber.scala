package views.support

import java.util.concurrent.TimeUnit
import implicits.Dates.CapiRichDateTime
import model.pressed.{CuratedContent, PressedStory}
import org.joda.time.DateTime

object ContentOldAgeDescriber extends ContentOldAgeDescriber

class ContentOldAgeDescriber {

  private val excludePaths = Set("law/2019/jun/14/yana-peel-uk-rights-advocate-serpentine-nso-spyware-pegasus")

  def apply(content: model.Content): String = {
    message(Some(content.trail.webPublicationDate), Some(content.metadata.id))
  }

  def apply(content: PressedStory): String = {
    message(Some(content.trail.webPublicationDate), Some(content.metadata.id))
  }

  def apply(content: model.ContentType): String = {
    message(Some(content.trail.webPublicationDate), Some(content.metadata.id))
  }

  def apply(apiContent: com.gu.contentapi.client.model.v1.Content): String = {
    message(apiContent.webPublicationDate.map(_.toJoda), Some(apiContent.id))
  }

  def apply(curatedContent: CuratedContent): String = {
    message(curatedContent.card.webPublicationDateOption, curatedContent.properties.maybeContentId)
  }

  private def message(maybePubDate: Option[DateTime], id: Option[String]) = {
    maybePubDate
      .map(pubDate => {
        val warnLimitDays = 30
        if (excludePaths.contains(id.getOrElse(""))) {
          ""
        } else if (pubDate.isBefore(DateTime.now().minusDays(warnLimitDays))) {
          val ageMillis = DateTime.now().getMillis - pubDate.getMillis
          val years = TimeUnit.MILLISECONDS.toDays(ageMillis) / 365
          val months = TimeUnit.MILLISECONDS.toDays(ageMillis) / 31
          val weeks = TimeUnit.MILLISECONDS.toDays(ageMillis) / 7
          val days = TimeUnit.MILLISECONDS.toDays(ageMillis)

          if (years >= 2) s"$years years"
          else if (years > 0) s"$years year"
          else if (months >= 2) s"$months months"
          else if (months > 0) s"$months month"
          else if (weeks >= 2) s"$weeks weeks"
          else if (weeks > 0) s"$weeks week"
          else s"$days days"
        } else {
          ""
        }
      })
      .getOrElse("")
  }

}
