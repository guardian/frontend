package model.commercial.masterclasses

import common.{AkkaAgent, ExecutionContexts, Logging}
import org.joda.time.DateTime

object MasterClassAgent extends Logging with ExecutionContexts {
  private val masterClass1 = MasterClass("1", "Guardian MasterClass A", new DateTime(),
    "http://www.theguardian.com", "Guardian MasterClass A", "Live", Ticket(1.0) :: Nil, 1, "http://www.theguardian.com")

  private val masterClass2 = masterClass1.copy(name = "Guardian MasterClass B", description= "Guardian MasterClass B")
  private val masterClass3 = masterClass1.copy(name = "Guardian MasterClass C", description= "Guardian MasterClass C")

  private val placeholder: List[MasterClass] =  List(masterClass1, masterClass2, masterClass3)

  private lazy val agent = AkkaAgent[List[MasterClass]](Nil)

  agent send placeholder

  def getUpcoming: List[MasterClass] =  {
    agent.get()
  }
  
  def refresh(){
    MasterClassesApi.getAll onSuccess{
      case results => {
        val upcomingEvents: List[MasterClass] = results.toList.filter(_.isOpen)
        if (!upcomingEvents.isEmpty) agent send upcomingEvents
      }
    }
  }
}
