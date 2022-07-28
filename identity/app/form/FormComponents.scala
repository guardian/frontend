package form

import com.softwaremill.macwire._
import play.api.i18n.MessagesApi

trait FormComponents {

  def messagesApi: MessagesApi

  lazy val profileFormsMapping = wire[ProfileFormsMapping]

  lazy val privacyMapping = wire[PrivacyMapping]
}
