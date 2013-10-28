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
        agent send results.toList.filter(event => (new DateTime(event.startDate)).isAfterNow)
      }
    }
  }
}
