package form

import com.softwaremill.macwire._
import play.api.i18n.MessagesApi

trait FormComponents {

  def messagesApi: MessagesApi

  lazy val profileFormsMapping: ProfileFormsMapping = wire[ProfileFormsMapping]

  lazy val privacyMapping: PrivacyMapping = wire[PrivacyMapping]
}
