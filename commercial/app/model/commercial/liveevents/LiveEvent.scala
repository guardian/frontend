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

  lazy val displayPrice = {
    val priceList = tickets.map(_.price).sorted.distinct
    if (priceList.size > 1) {
      val (low, high) = (priceList.head, priceList.last)
      f"£$low%,.2f to £$high%,.2f"
    } else f"£${priceList.head}%,.2f"
  }
}
