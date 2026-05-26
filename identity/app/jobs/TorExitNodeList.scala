package jobs

import common.{Box, GuLogging}

import java.net.InetAddress

import scala.io.Source

object TorExitNodeList extends GuLogging {

  private val torExitNodeAgent = Box[Set[String]](Set.empty)
  private val torNodeListUrl = "https://check.torproject.org/cgi-bin/TorBulkExitList.py"

  def run(): Unit = {
    log.info("Updating tor list for current list for %s".format("profile.theguardian.com"))
    val addresses = InetAddress.getAllByName("profile.theguardian.com")

    val nodes = addresses map { address =>
      val ip = address.getHostAddress
      val url = s"$torNodeListUrl?ip=$ip&port=80"
      Source.fromURL(url).getLines().toList.filterNot { line => line.startsWith("#") }
    }

    val allNodes = nodes.toList.flatMap { x => x }.toSet
    torExitNodeAgent.send(allNodes)
  }

  def getTorExitNodes: Set[String] = torExitNodeAgent.get()
}
