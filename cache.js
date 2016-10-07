var cache = {};

module.exports = {
    set: function(key, value) {
        cache[key] = value;

        //console.log("CacheSet", cache);
    },

    get: function(key, defaultValue) {
        var ret = cache[key] || defaultValue || null;

        //console.log("CacheSet", cache);

        return ret;
    },

    keys: function() {
        return Object.keys(cache);
    }
};
