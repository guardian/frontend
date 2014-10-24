package jobs

import common.{AkkaAgent, Logging, ExecutionContexts}
import services.S3Infosec

object BlockedEmailDomainList extends ExecutionContexts with Logging {

  private val blockedDomainAgent = AkkaAgent[List[String]](List.empty)

  def run () {
    val dummy = List("one", "two")
    val domains = S3Infosec.getBlockedEmailDomains map {
      blocList =>
        log.info("GOT: " + blocList)
        blocList.split("\n").toList
    } getOrElse List()
    log.info("Updating email blocked domains list")
    blockedDomainAgent.send(domains)
  }

  def getBlockedDomains = blockedDomainAgent.get()

}
