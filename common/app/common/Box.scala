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
  def modify(f: T => Try[T]): Future[T]

  def map[A](f: T => A): Box[A]
  def flatMap[A](f: T => Box[A]): Box[A]
}

object Box {
  def apply[T](initialValue: T): Box[T] = new AtomicRefBox[T](initialValue)
}

private class AtomicRefBox[T](t: T) extends Box[T] {
  private val ref: AtomicReference[T] = new AtomicReference[T](t)

  def apply(): T = ref.get()
  def get(): T = ref.get()

  def send(t: T): Unit = ref.set(t)
  def send(f: T => T): Unit = ref.updateAndGet(t => f(t))

  def alter(t: T): Future[T] = Future.successful(ref.updateAndGet(_ => t))
  def alter(f: T => T): Future[T] = Future.successful(ref.updateAndGet(_ => f(t)))
  def modify(f: T => Try[T]): Future[T] =
    f(t) match {
      case Success(v) => Future.successful(ref.updateAndGet(_ => v))
      case Failure(e) => Future.failed(e)
    }

  def map[A](f: T => A): Box[A] = new AtomicRefBox[A](f(get()))
  def flatMap[A](f: T => Box[A]): Box[A] = f(get())
}
