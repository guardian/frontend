/* jscs:disable disallowDanglingUnderscores */
import Injector from 'helpers/injector';
import sinon from 'sinonjs';

const injector = new Injector();

describe('User ad preference service', ()=> {
    const adfreeExpiryStorageKey = 'gu_adfree_user_expiry';

    let renewAdfreeStatus, storage, adfreeRequest, environmentXHR;

    beforeEach(done => {
        injector.test([
            'common/modules/commercial/adfree/renew-adfree-status',
            'common/utils/storage'
        ], function () {
            [renewAdfreeStatus, storage] = arguments;
            done();
        });
    });

    describe('Making the request', ()=> {
        beforeEach(()=> {
            environmentXHR = sinon.useFakeXMLHttpRequest();
            environmentXHR.onCreate = xhr => {
                adfreeRequest = xhr;
            };
        });

        afterEach(()=> {
            environmentXHR.restore();
        });

        it('Makes a GET request to the members data API', ()=> {
            renewAdfreeStatus.renew();
            expect(adfreeRequest.method).toBe('GET');
            expect(adfreeRequest.url).toBe('https://members-data-api.theguardian.com/user-attributes/me/adfree');
        });

        it('Makes asynchronous requests', ()=> {
            renewAdfreeStatus.renew();
            expect(adfreeRequest.async).toBe(true);
        });
    });

    describe('Handling the response', ()=> {
        const now = new Date().getTime();
        const response = {
            adfree : true,
            issuedAt : now
        };
        const serializedResponse = JSON.stringify(response);

        beforeEach(()=> {
            storage.local.remove(adfreeExpiryStorageKey);
        });

        it('Adds an adfree status expiry time to localstorage', ()=> {
            renewAdfreeStatus._handleResponse(serializedResponse);
            const storedExpiryDate = storage.local.get(adfreeExpiryStorageKey);
            expect(storedExpiryDate).toEqual(jasmine.any(Number));
        });

        it('That expiry time is in the future', ()=> {
            renewAdfreeStatus._handleResponse(serializedResponse);
            const storedExpiryDate = storage.local.get(adfreeExpiryStorageKey);
            expect(storedExpiryDate > now).toBeTruthy();
        });
    });

});
