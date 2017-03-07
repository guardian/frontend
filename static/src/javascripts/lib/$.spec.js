import $ from './$';

beforeEach(() => {
    document.body.innerHTML = `
        <div class="main">
            <div class="child">child content</div>
            <div class="forEachTarget"><p></p><p class="blue"></p></div>
            <div id="ancestorTarget" class="grandparent"><h1><em><span class="grandchild"></span></em></h1>
            </div>
        </div>
    `;
});

test('$', () => {
    expect($('.child').text()).toEqual('child content');

    expect($.create('<p><span class="test-class"></span></p>').html()).toEqual(
        '<span class="test-class"></span>'
    );

    $.forEachElement('.forEachTarget > *', el => el.classList.add('red'));
    expect($('.forEachTarget').html()).toEqual(
        '<p class="red"></p><p class="blue red"></p>'
    );

    expect(
        $.ancestor(
            document.querySelector('.grandchild'),
            'no-element-has-this-class'
        )
    ).toBeFalsy();
    expect(
        $.ancestor(document.querySelector('.grandchild'), 'grandparent').id
    ).toEqual('ancestorTarget');
});
