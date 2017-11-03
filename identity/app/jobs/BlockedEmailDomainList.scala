package jobs

import com.gu.Box
import common.Logging
import services.S3Infosec

object BlockedEmailDomainList extends Logging {

  private val blockedDomainAgent = Box[Set[String]](Set.empty)

  def run () {
    log.info("Updating email blocked domains list")

    val domains = S3Infosec.getBlockedEmailDomains map {
      blockedDomains => blockedDomains.split("\n").toSet
    } getOrElse Set()
    blockedDomainAgent.send(domains)
  }

  def getBlockedDomains: Set[String] = blockedDomainAgent.get()

}
