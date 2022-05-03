package capiFirehoseConsumer

import com.gu.contentapi.client.model.v1.Content
import com.gu.contentapi.firehose.client.StreamListener
import com.gu.contentatom.thrift.Atom
import com.gu.crier.model.event.v1.RetrievableContent
import common.GuLogging

class CrierStreamReader extends GuLogging with StreamListener {
  override def contentUpdate(content: Content): Unit = {
    log.info(s"CrierStreamReader read content update for ${content.id}")
  }

  override def contentRetrievableUpdate(content: RetrievableContent): Unit = {
    log.info(s"CrierStreamReader read content retrievable update for ${content.id}")
  }

  override def contentTakedown(contentId: String): Unit = {
    log.info(s"CrierStreamReader read content takedown for ${contentId}")
  }

  override def atomUpdate(atom: Atom): Unit = {
    log.info(s"CrierStreamReader read atom update for ${atom.id}")
  }
}
