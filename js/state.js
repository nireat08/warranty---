const RegState = {
    step: 1,
    isSerialVerified: false,
    stores: [],
    storeDataMap: {},

    formData: {
        service: false, privacy: false, thirdParty: false, transfer: false, marketing: false,
        serialNo: '', userName: '', userPhone: '', product: '', storeName: '', storeCode: ''
    },

    init: function () {
        this.load();
    },

    save: function () {
        // 체크박스 상태는 저장하지 않도록 필터링 (새로고침 시 초기화 요구사항)
        const keysToExclude = ['service', 'privacy', 'thirdParty', 'transfer', 'marketing'];
        const dataToSave = { ...this.formData };

        keysToExclude.forEach(key => {
            delete dataToSave[key];
        });

        sessionStorage.setItem('regFormData', JSON.stringify(dataToSave));
    },

    load: function () {
        const saved = sessionStorage.getItem('regFormData');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // 로드 시에도 체크박스 상태는 무시 (기존 저장된 값 영향 제거)
                const keysToExclude = ['service', 'privacy', 'thirdParty', 'transfer', 'marketing'];
                keysToExclude.forEach(key => delete parsed[key]);

                this.formData = { ...this.formData, ...parsed };
            } catch (e) {
                console.warn('Failed to load saved state');
            }
        }
    },

    clear: function () {
        sessionStorage.removeItem('regFormData');
        this.formData = {
            service: false, privacy: false, thirdParty: false, transfer: false, marketing: false,
            serialNo: '', userName: '', userPhone: '', product: '', storeName: '', storeCode: ''
        };
    }
};
