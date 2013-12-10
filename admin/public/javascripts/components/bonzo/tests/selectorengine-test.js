/*global sink:true start:true Q:true dom:true $:true bowser:true ender:true*/

sink('Selector engine', function (test, ok) {
  if (!document.querySelectorAll) {
    test('use default selector engine', 1, function () {
      bonzo._setQueryEngine(Q)
      ok(true)
    })
  }

  function insertCreatedNodes () {
    var node = bonzo.create('<p>world</p>')[0]
      , node2 = bonzo.create('<p>hello</p>')[0]
    bonzo([node, node2]).prependTo('.prepend-with-engine')
    ok(Q('.prepend-with-engine p').length == 4, 'prepends 4 elements total')
  }

  function insertExistingNodes () {
    bonzo(Q('.prepend-with-engine p')).prependTo('.prepend-with-engine-move')
    ok(Q('.prepend-with-engine p').length === 0, 'prepend now has no elements')
    ok(Q('.prepend-with-engine-move p').length == 4, 'elements were moved to target selector')
    bonzo(Q('.prepend-with-engine-move')).empty() // reset
  }

  test('pre-setQueryEngine() run insert with created nodes', 1, insertCreatedNodes)
  test('pre-setQueryEngine() run insert with existing nodes', 2, insertExistingNodes)

  if (document.querySelectorAll) {
    test('set selector engine', 1, function () {
      bonzo._setQueryEngine(Q)
      ok(true)
    })

    test('post-setQueryEngine() run insert with created nodes', 1, insertCreatedNodes)
    test('post-setQueryEngine() run insert with existing nodes', 2, insertExistingNodes)
  }
})