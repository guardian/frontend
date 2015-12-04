package views.support

import java.util.concurrent.TimeUnit
import org.joda.time.DateTime

object ContentOldAgeDescriber extends ContentOldAgeDescriber

class ContentOldAgeDescriber {
  def apply(content: model.Content): String = {
    message(content.trail.webPublicationDate)
  }

  def apply(apiContent: com.gu.contentapi.client.model.Content): String = {
    message(apiContent.webPublicationDate)
  }

  private def message(pubDate: DateTime) = {
    val warnLimitDays = 30
    if(pubDate.isBefore(DateTime.now().minusDays(warnLimitDays))) {
      val ageMillis = DateTime.now().getMillis - pubDate.getMillis
      val years = TimeUnit.MILLISECONDS.toDays(ageMillis) / 365
      val months = TimeUnit.MILLISECONDS.toDays(ageMillis) / 28
      val weeks = TimeUnit.MILLISECONDS.toDays(ageMillis) / 7
      val days = TimeUnit.MILLISECONDS.toDays(ageMillis)

      if(years >= 2) s"$years years"
      else if(years > 0) s"$years year"
      else if(months >= 2) s"$months months"
      else if(months > 0) s"$months month"
      else if(weeks >= 2) s"$weeks weeks"
      else if(weeks > 0) s"$weeks week"
      else s"$days days"

    } else {
      ""
    }
  }

}
