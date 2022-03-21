package common

import java.util.concurrent.atomic.AtomicReference

import scala.concurrent.Future
import scala.util.{Try, Success, Failure}

abstract class Box[T] {
  def get(): T
  def apply(): T

  def send(t: T): Unit
  def send(f: T => T): Unit

  def alter(t: T): Future[T]
  def alter(t: T => T): Future[T]
}

object Box {
  def apply[T](initialValue: T): Box[T] = new AtomicRefBox[T](initialValue)
}

private class AtomicRefBox[T](initialValue: T) extends Box[T] {
  private val ref: AtomicReference[T] = new AtomicReference[T](initialValue)

  def apply(): T = ref.get()
  def get(): T = ref.get()

  def send(t: T): Unit = ref.set(t)
  def send(f: T => T): Unit = ref.updateAndGet(t => f(t))

  def alter(t: T): Future[T] = Future.successful(ref.updateAndGet(_ => t))
  def alter(f: T => T): Future[T] = Future.successful(ref.updateAndGet(t => f(t)))
}
