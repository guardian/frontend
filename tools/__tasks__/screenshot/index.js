module.exports = {
    description: 'Oke Doke, taking some screenshots for you... This may take a while',
    task: [
        require('./check-network'),
        require('./screenshot')
    ]
};
