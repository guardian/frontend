package conf

import common.GuardianConfiguration
import utils.SafeLogging

class IdentityConfiguration(conf: GuardianConfiguration) extends IdConfig with SafeLogging {
  val accountDeletionApiKey: String = conf.id.accountDeletionApiKey
  val accountDeletionApiRoot: String = conf.id.accountDeletionApiRoot
  val apiClientToken: String = conf.id.apiClientToken
  val apiRoot: String = conf.id.apiRoot
  val domain: String = conf.id.domain
  val oauthUrl: String = conf.id.oauthUrl
  val url: String = conf.id.url
  val membersDataApiUrl: String = conf.id.membersDataApiUrl
  val discussionApiUrl: String = conf.discussion.apiRoot
}

trait IdConfig {
  val apiRoot: String
  val apiClientToken: String
  val accountDeletionApiRoot: String
  val accountDeletionApiKey: String
  val url: String
  val oauthUrl: String
  val domain: String
}
