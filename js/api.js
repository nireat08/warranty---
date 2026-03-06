const RegAPI = {
    fetchInitialData: async function () {
        return fetchWithRetry(API_URL, {}, 3);
    },

    checkSerial: async function (serialNo) {
        return fetchWithRetry(`${API_URL}?type=check&no=${serialNo}`, {}, 2);
    },

    submitForm: async function (payload) {
        return fetchWithRetry(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
        }, 5, 1000);
    }
};
