package common.dfp

import java.net.URI
import common.Edition

trait AdSlotAgent {

  protected def takeoversWithEmptyMPUs: Seq[TakeoverWithEmptyMPUs]

  def omitMPUsFromContainers(pageId: String, edition: Edition): Boolean = {

    def toPageId(url: String): String = new URI(url).getPath.tail

    val current = takeoversWithEmptyMPUs filter { takeover =>
      takeover.startTime.isBeforeNow && takeover.endTime.isAfterNow
    }

    current exists { takeover =>
      toPageId(takeover.url) == pageId && takeover.editions.contains(edition)
    }
  }
}

sealed abstract class AdSlot(val name: String)
