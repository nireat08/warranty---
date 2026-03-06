const RegState = {
    step: 1,
    isSerialVerified: false,
    stores: [],
    storeDataMap: {},

    formData: {
        privacy: false, thirdParty: false, transfer: false, marketing: false,
        serialNo: '', userName: '', userPhone: '', product: '', storeName: '', storeCode: ''
    },

    init: function () {
        this.load();
    },

    save: function () {
        localStorage.setItem('regFormData', JSON.stringify(this.formData));
    },

    load: function () {
        const saved = localStorage.getItem('regFormData');
        if (saved) {
            try {
                this.formData = { ...this.formData, ...JSON.parse(saved) };
            } catch (e) {
                console.warn('Failed to load saved state');
            }
        }
    },

    clear: function () {
        localStorage.removeItem('regFormData');
        this.formData = {
            privacy: false, thirdParty: false, transfer: false, marketing: false,
            serialNo: '', userName: '', userPhone: '', product: '', storeName: '', storeCode: ''
        };
    }
};
