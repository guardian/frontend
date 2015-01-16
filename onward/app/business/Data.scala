package business

import common.{ResourcesHelper, AkkaAgent}

object Data extends ResourcesHelper {
  val agent = AkkaAgent[Option[Indices]](None)

  // for now we'll just load a fixture as we've not got the feed yet
  agent.send(Some(slurpJsonOrDie[Indices]("business-indices.json")))
}
