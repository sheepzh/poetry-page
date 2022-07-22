function getJson(url, callback, errorCallback) {
    $.ajax(`/json${url}`, {
        methods: 'get',
        success: callback,
        error: errorCallback
    })
}