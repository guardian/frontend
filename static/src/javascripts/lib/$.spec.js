import $ from './$';

beforeEach(() => {
    if (document.body) {
        document.body.innerHTML = `
        <div class="grandparent" id="ancestorTarget">
            <div class="parent">
                <div class="child">child content</div>
                <div class="sibling"></div>
            </div>
        </div>`;
    }
});

describe('$', () => {
    test('finds an element and bonzos it', () => {
        expect($('.child').text()).toEqual('child content');
    });

    test('creates an element and bonzos it', () => {
        expect(
            $.create('<p><span class="test-class"></span></p>').html()
        ).toEqual('<span class="test-class"></span>');
    });

    test('applies a function to an array of elements described by a selector', () => {
        $.forEachElement('.parent > *', el => el.classList.add('red'));
        expect($('.child').hasClass('red')).toBe(true);
        expect($('.sibling').hasClass('red')).toBe(true);
    });

    test("can find an element's ancestor", () => {
        expect(
            $.ancestor(
                document.querySelector('.child'),
                'no-element-has-this-class'
            )
        ).toBe(null);
        expect(
            $.ancestor(document.querySelector('.child'), 'grandparent')
        ).toEqual(expect.objectContaining({ id: 'ancestorTarget' }));
    });
});
