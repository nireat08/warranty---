async function getRecaptchaToken(action) {
    if (typeof grecaptcha === 'undefined') return null;
    return new Promise((resolve) => {
        grecaptcha.ready(function() {
            grecaptcha.execute(RECAPTCHA_SITE_KEY, {action: action}).then(function(token) {
                resolve(token);
            }).catch(() => resolve(null));
        });
    });
}

const RegAPI = {
    fetchInitialData: async function () {
        const token = await getRecaptchaToken('fetchInitialData');
        const headers = token ? { 'x-recaptcha-token': token } : {};
        return fetchWithRetry(API_URL, { headers }, 3);
    },

    checkSerial: async function (serialNo) {
        const token = await getRecaptchaToken('checkSerial');
        const headers = token ? { 'x-recaptcha-token': token } : {};
        return fetchWithRetry(`${API_URL}?type=check&no=${serialNo}`, { headers }, 2);
    },

    submitForm: async function (payload) {
        const token = await getRecaptchaToken('submitForm');
        const headers = { "Content-Type": "text/plain;charset=utf-8" };
        if (token) headers['x-recaptcha-token'] = token;
        
        return fetchWithRetry(API_URL, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        }, 5, 1000);
    }
};
