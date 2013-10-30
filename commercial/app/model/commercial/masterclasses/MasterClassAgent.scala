package model.commercial.masterclasses

import common.{AkkaAgent, ExecutionContexts, Logging}
import org.joda.time.DateTime

object MasterClassAgent extends Logging with ExecutionContexts {
  private lazy val agent = AkkaAgent[List[MasterClass]](Nil)

  def getUpcoming: List[MasterClass] =  {
    agent.get()
  }
  
  def refresh(){
    MasterClassesApi.getAll onSuccess{
      case results => {
        val upcomingEvents: List[MasterClass] = results.toList.filter(event => (event.isOpen))
        agent send upcomingEvents
      }
    }
  }
}
