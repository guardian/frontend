package model.commercial.liveevents

import model.commercial.masterclasses.{Ticket}

case class LiveEvent(id: String,
                     title: String,
                     date: String,
                     location: String,
                     description: String,
                     tickets: List[Ticket],
                     imageUrl: String,
                     eventUrl: String) {

  lazy val ratioTicketsLeft = 1 - (tickets.map(_.quantitySold).sum.toDouble / tickets.map(_.quantityTotal).sum)
}
