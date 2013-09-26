/*global sink:true start:true Q:true dom:true $:true bowser:true ender:true*/

sink('Ender bridge', function (test, ok, before, after, assert) {
  test('height & width', 8, function () {
    var $el = ender(dom.create('<div/>')).css({
            height: '50px'
          , width: '200px'
          , lineHeight: 0 // old IE
        }).appendTo(document.body)

    ok($el.height() == 50, 'initial height() is 50')
    ok($el.width() == 200, 'initial width() is 200')

    $el.height(100)
    ok($el.height() == 100, 'after height(100), height() reports 100')
    ok($el.width() == 200, 'after height(100), width() reports 200')

    $el.width(20)
    ok($el.width() == 20, 'after width(20), width() reports 20')
    ok($el.height() == 100, 'after width(20), height() reports 100')

    $el.height(0)
    ok($el.height() === 0, 'after height(0), height() reports 0')

    $el.width(0)
    ok($el.width() === 0, 'after width(0), width() reports 0')

    $el.remove()
  })

  test('height & width of `document`', 2, function () {
    ok(ender(document).height() > 0)
    ok(ender(document).width() > 0)
  })

  test('no-arg parents()', 5, function () {
    try {
      var parents = ender('#parent-test').parents()
      assert.equal(parents.length, 4, '#parent-test has 4 parents')
      assert.equal(parents[0].id, 'parent-test-wrapper', 'first parent is correct')
      assert.equal(parents[1].id, 'fixtures', 'second parent is correct')
      ok(parents[2] === document.body, 'third parent is "body"')
      ok(parents[3] === document.documentElement, 'fourth parent is "html"')
    } catch (e) {
      ok(false, 'parents() threw exception ' + e)
    }
  })

/* test for #74 when someone has the time to implement a proper parents crawl
  test('parents() on detached element', 3, function () {
    var $el = ender([dom.create('<div><span><a></a></span></div>')[0].childNodes[0].childNodes[0]])
      , $parents = $el.parents('*')

    assert.equal($parents.length, 2, 'has 2 parents')
    if ($parents.length >= 2) {
        assert.equal($parents[0].className.toLowerCase(), 'span', 'has correct first parent')
        assert.equal($parents[1].className.toLowerCase(), 'div', 'has correct second parent')
    }
  })
*/
})