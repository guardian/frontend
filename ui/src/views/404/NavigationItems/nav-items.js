// @flow
const data: Array<{
    path: string,
    link: string,
    zone?: string,
    newWindow?: boolean,
}> = [
    {
        path: '/',
        link: 'home',
    },
    {
        zone: 'news',
        path: '/uk',
        link: 'UK',
    },
    {
        zone: 'news',
        path: '/world',
        link: 'world',
    },
    {
        zone: 'sport',
        path: '/sport',
        link: 'sport',
    },
    {
        zone: 'sport',
        path: '/football',
        link: 'football',
    },
    {
        zone: 'comment',
        path: '/commentisfree',
        link: 'comment',
    },
    {
        zone: 'culture',
        path: '/culture',
        link: 'culture',
    },
    {
        zone: 'business',
        path: '/business',
        link: 'economy',
    },
    {
        zone: 'lifeandstyle',
        path: '/lifeandstyle',
        link: 'life',
    },
    {
        zone: 'lifeandstyle',
        path: '/fashion',
        link: 'fashion',
    },
    {
        zone: 'environment',
        path: '/environment',
        link: 'environment',
    },
    {
        path: '/technology',
        link: 'tech',
    },
    {
        path: '/money',
        link: 'money',
    },
    {
        path: '/travel',
        link: 'travel',
    },
    {
        path: 'https://soulmates.guardian.co.uk/',
        link: 'soulmates',
    },
    {
        path: 'http://m.jobs.guardian.co.uk/',
        newWindow: true,
        link: 'jobs',
    },
    {
        path: '/guardian-masterclasses',
        newWindow: true,
        link: 'masterclasses',
    },
];
export default data;
