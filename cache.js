var cache = {};

module.exports = {
    set: function(key, value) {
        cache[key] = value;
    },

    get: function(key, defaultValue) {
        return cache[key] || defaultValue || null;
    }
};
