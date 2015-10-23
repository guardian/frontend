import _ from 'common/utils/_';
import sinon from 'sinonjs';
import cookies from 'common/utils/cookies';

describe('Cookies', function () {

    var clock,
        mockDocument;

    beforeEach(function () {
        // make a mock document cookie object
        clock = sinon.useFakeTimers();
        mockDocument = {
            value: '',

            get cookie() {
                return this.value.replace('|', ';').replace(/^[;|]|[;|]$/g, '');
            },

            set cookie(value) {
                var name = value.split('=')[0];
                this.value = _(this.value.split('|'))
                    .remove(function (cookie) {
                        return cookie.split('=')[0] !== name;
                    })
                    .push(value)
                    .join('|');
            },

            domain: 'www.theguardian.com'
        };
        cookies.test.setDocument(mockDocument);
    });

    afterEach(function () {
        clock.restore();
        cookies.test.setDocument(null);
    });

    it('should be able the clean a list of cookies', function () {

        mockDocument.cookie = 'cookie-1-name=cookie-1-value';
        mockDocument.cookie = 'cookie-2-name=cookie-2-value';
        mockDocument.cookie = 'cookie-3-name=cookie-3-value';

        cookies.cleanUp(['cookie-1-name', 'cookie-2-name']);

        var c = mockDocument.cookie;

        expect(c).toMatch('cookie-1-name=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=.theguardian.com');
        expect(c).toMatch('cookie-2-name=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=.theguardian.com');

    });

    it('should be able to set a cookie', function () {
        cookies.add('cookie-1-name', 'cookie-1-value');
        expect(mockDocument.cookie).toMatch(
            'cookie-1-name=cookie-1-value; path=/; expires=Sun, 31 May 1970 23:00:00 GMT; domain=.theguardian.com'
        );
        clock.restore();
    });

    it('should be able to set a cookie for a specific number of days', function () {
        cookies.add('cookie-1-name', 'cookie-1-value', 7);
        expect(mockDocument.cookie).toEqual(
            'cookie-1-name=cookie-1-value; path=/; expires=Thu, 08 Jan 1970 00:00:00 GMT; domain=.theguardian.com'
        );
    });

    it('should be able to set a cookie for a specific number of minutes', function () {
        cookies.addForMinutes('cookie-1-name', 'cookie-1-value', 91);
        expect(mockDocument.cookie).toEqual(
            'cookie-1-name=cookie-1-value; path=/; expires=Thu, 01 Jan 1970 01:31:00 GMT; domain=.theguardian.com'
        );
    });

    it('should be able to set a session cookie', function () {
        cookies.addSessionCookie('cookie-1-name', 'cookie-1-value');
        expect(mockDocument.cookie).toEqual('cookie-1-name=cookie-1-value; path=/; domain=.theguardian.com');
    });

    it('should be able remove cookies', function () {
        cookies.remove('cookie-1-name');
        expect(mockDocument.cookie).toEqual(
            'cookie-1-name=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=.theguardian.com'
        );
    });

});

describe('Cookies read', function () {

    var clock,
        mockDocument;

    beforeEach(function () {
        // make a mock document cookie object
        clock = sinon.useFakeTimers();
        mockDocument = {
            value: '',

            cookie: 'optimizelyEndUserId=oeu1398171767331r0.5280374749563634; __qca=P0-938012256-1398171768649; __gads=ID=85aa476fff43818a:T=1398171769:S=ALNI_MbfMkJmvVDwlqDMvJk1oCBV3jNUoA; noticebar_cookie=2; GU_mvt_id=717659; fsr.r=%7B%22d%22%3A90%2C%22i%22%3A%22de37431-93457748-eb61-2581-cce6c%22%2C%22e%22%3A1416223264445%7D; _ga=GA1.2.555908995.1398171761; QSI_HistorySession=http%3A%2F%2Fwww.theguardian.com%2Fworld%2F2014%2Fnov%2F11%2Findian-women-die-mass-steri…ov%2F11%2Fputin-gallant-gesture-chinese-leader-wife-censored~1415796988465; mlUserID=amIIKWa5S6ha; _em_vt=eed0af5afb2b123c5293cbae36c953ec8ab6445d73-180037745475ec3b; GU_EDITION=UK; GU_MI=mi_i%3D13552794%3Bmi_p%3DCRE%2CRCO%3Bgu_pk%3DCRE%2CRCO%3Bmi_e%3D%21201412141140%3Bmi_dn%3DJohn+Duffell%3Bmi_s%3Da7dd96e91fffd189215abaa69107bf13; GU_U=WyIxMzU1Mjc5NCIsImpvaG4uZHVmZmVsbEBndWFyZGlhbi5jby51ayIsIkpvaG4gRHVmZmVsbCIsIjIiLDE0MjQ5NTA4NDgwMDEsMSwxNDA1OTUxMDgyMDAwLHRydWVd.MCwCFErJFuSa3ptSv2V6JYkIjTtTFUKiAhQDLOlsFAulk4mg7yj8DWswB3p_1Q; _cb_ls=1; s_campaign=twt_gu; _chartbeat2=CbF00iBuBN28SPnnY.1417174852129.1417516877697.10001; fsr.s=%7B%22v2%22%3A-2%2C%22v1%22%3A1%2C%22rid%22%3A%22de37431-93457748-eb61-2581-cce6c%22%2C%22ru%22%3A%22http%3A%2F%2Fwww.theguardian.com%2Fuk%22%2C%22r%22%3A%22www.theguardian.com%22%2C%22st%2…22Y%22%7D%2C%22l%22%3A%22en%22%2C%22i%22%3A-1%2C%22f%22%3A1417516902586%7D; fsr.a=1417516904960; s_pers=%20s_fid%3D7BD36E2BEA3FA475-209CB26F08488520%7C1473689665518%3B%20s_daily_habit%3D16315%252C16316%252C16317%252C16318%252C16321%252C16323%252C16325%7C1568297665542%3B%20s_lv%3D1413290266527%7C1507898266527%3B%20s_nr%3D1413290266538-Repeat%7C1444826266538%3B%20s_prev_prop9%3Dno%2520value%7C1417605835703%3B; s_sess=%20s_sv_sid%3D1337774611744%3B%20s_campaign%3DEMCNEWEML6619I2%3B%20s_ppv%3D-%252C17%252C17%252C695%3B%20s_cc%3Dtrue%3B%20s_visit%3D1%3B%20s_sq%3Dguardiangu-network%253D%252526pid%25253DGFE%2525253Anews%2525253AArticle%2525253A10-years-bullying-data%252526pidt%25253D1%252526oid%25253Dhttp%2525253A%2525252F%2525252Fwww.theguardian.com%2525252Fpreference%2525252Fplatform%2525252Fclassic%252…%252525252F2013%252525252Fmay%252525252F23%252525252F1%252526ot%25253DA%3B; OAX=X5GDnlPairgACdD1; optimizelySegments=%7B%22172123993%22%3A%22none%22%2C%22172180831%22%3A%22none%22%2C%22172233718%22%3A%22false%22%2C%22172284779%22%3A%22gc%22%2C%22172321425%22%3A%22false%22%2C%22172361369%22%3A%22referral%22%2C%22172368238%22%3A%22search%22%2C%22172387121%22%3A%22gc%22%2C%22280150302%22%3A%22gc%22%2C%22280266488%22%3A%22false%22%2C%22280820196%22%3A%22none%22%2C%22280923576%22%3A%22referral%22%2C%22290314994%22%3A%22false%22%2C%22290553915%22%3A%22direct%22%2C%22293452255%22%3A%22gc%22%2C%22293462044%22%3A%22none%22%2C%22812091703%22%3A%22true%22%2C%22813360577%22%3A%22true%22%2C%221214390054%22%3A%22true%22%2C%221992100896%22%3A%22false%22%2C%222001830212%22%3A%22none%22%2C%222004900216%22%3A%22referral%22%2C%222005870214%22%3A%22gc%22%7D; optimizelyBuckets=%7B%7D; s_pers=%20s_fid%3D7BD36E2BEA3FA475-209CB26F08488520%7C1473689665518%3B%20s_daily_habit%3D16315%252C16316%252C16317%252C16318%252C16321%252C16323%252C16325%7C1568297665542%3B%20s_lv%3D1413290266527%7C1507898266527%3B%20s_prev_prop9%3Dno%2520value%7C1417605835703%3B%20s_nr%3D1417605906076-Repeat%7C1449141906076%3B; s_sess=%20s_sv_sid%3D1337774611744%3B%20s_campaign%3DEMCNEWEML6619I2%3B%20s_ppv%3D-%252C17%252C17%252C695%3B%20s_cc%3Dtrue%3B%20s_visit%3D1%3B%20s_sq%3Dguardiangu-network%253D%252526pid%25253DGFE%2525253Anews%2525253AArticle%2525253A10-years-bullying-data%252526pidt%25253D1%252526oid%25253Dhttp%2525253A%2525252F%2525252Fwww.theguardian.com%2525252Fpreference%2525252Fplatform%2525252Fclassic%252…%252525252F2013%252525252Fmay%252525252F23%252525252F1%252526ot%25253DA%3B; s_sq=%5B%5BB%5D%5D; GU_VIEW=responsive; s_cc=true; bwid=kvdn_943h8SSC6h3R5hyJ31g; s_fid=470C3252CA9A4650-35C6B54A21985FBA; s_daily_habit=16406%2C16407%2C16408; s_lv=1417705099834; s_nr=1417705099835-Repeat; s_vi=[CS]v1|29AB343C05013259-4000014980021C3D[CE]; cto2_guardian=',

            domain: 'www.theguardian.com'
        };
        cookies.test.setDocument(mockDocument);
    });

    afterEach(function () {
        clock.restore();
        cookies.test.setDocument(null);
    });

    it('should be able to get a cookie', function () {
        // s_vi=[CS]v1|29AB343C05013259-4000014980021C3D[CE]
        var cookieValue = cookies.get('s_vi');
        expect(cookieValue).toEqual('[CS]v1|29AB343C05013259-4000014980021C3D[CE]');
    });

});


