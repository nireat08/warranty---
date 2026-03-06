/**
 * 제품 등록 및 보증 연장 페이지 메인 로직
 */

document.addEventListener("DOMContentLoaded", function () {
    // 1. 상태 병합 및 초기화
    RegState.init();

    // 2. 초기 데이터 로드 (제품 목록, 매장 목록)
    RegAPI.fetchInitialData().then(data => {
        const productSelect = document.getElementById("productSelect");
        if (productSelect) RegUI.updateSelectOptions(productSelect, data.products, "제품 모델 선택");

        RegState.stores = data.stores;
        data.stores.forEach(store => { RegState.storeDataMap[store.name] = store; });

        const storeInput = document.getElementById("storeInput");
        if (storeInput) storeInput.placeholder = "매장명, 대리점명, 주소 검색";

        // 데이터 로드 후 저장된 상태 적용
        RegUI.applySavedState();
    }).catch(err => console.error("데이터 로딩 실패"));

    // 3. 이벤트 바인딩 - 약관 동의
    const allAgree = document.getElementById("allAgree");
    const agreeItems = document.querySelectorAll(".agree-item");
    if (allAgree) {
        allAgree.addEventListener("change", function () {
            agreeItems.forEach(item => item.checked = allAgree.checked);
            saveAgreeState();
        });
    }
    agreeItems.forEach(item => {
        item.addEventListener("change", function () {
            const allChecked = Array.from(agreeItems).every(i => i.checked);
            if (allAgree) allAgree.checked = allChecked;
            saveAgreeState();
        });
    });

    function saveAgreeState() {
        RegState.formData.privacy = document.getElementById("privacyAgree").checked;
        RegState.formData.thirdParty = document.getElementById("thirdPartyAgree").checked;
        RegState.formData.transfer = document.getElementById("transferAgree").checked;
        RegState.formData.marketing = document.getElementById("marketingAgree").checked;
        RegState.save();
    }

    // 4. 이벤트 바인딩 - 파일 업로드
    const receiptFile = document.getElementById("receiptFile");
    const previewImg = document.getElementById("imgPreview");
    if (receiptFile) {
        receiptFile.addEventListener("change", function () {
            if (this.files.length > 0) {
                if (this.files[0].size > Utils.MAX_FILE_SIZE) {
                    Utils.showAlert("❌ 파일 용량이 3MB를 초과합니다!\n용량을 줄여서 다시 올려주세요.");
                    this.value = ""; previewImg.style.display = "none"; return;
                }
                const reader = new FileReader();
                reader.onload = function (e) { previewImg.src = e.target.result; previewImg.style.display = "block"; }
                reader.readAsDataURL(this.files[0]);
            } else { previewImg.style.display = "none"; }
        });
    }

    // 5. 이벤트 바인딩 - 매장 검색
    const storeInput = document.getElementById("storeInput");
    const storeCodeInput = document.getElementById("storeCode");
    const suggestions = document.getElementById("suggestions");
    const infoDisplay = document.getElementById("storeInfoDisplay");

    if (storeInput) {
        storeInput.addEventListener("input", function () {
            RegUI.renderStoreSuggestions(this.value.toLowerCase().trim(), storeInput, storeCodeInput, suggestions, infoDisplay);
        });
    }

    document.addEventListener("click", function (e) {
        if (storeInput && !storeInput.contains(e.target) && suggestions && !suggestions.contains(e.target)) {
            suggestions.style.display = "none";
        }
    });

    // 6. 이벤트 바인딩 - 사용자 정보 (전화번호 하이픈 등)
    const phoneInput = document.getElementById("userPhone");
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            e.target.value = Utils.formatPhone(e.target.value);
            RegState.formData.userPhone = e.target.value;
            RegState.save();
        });
    }

    // 일반 입력 필드 저장
    const saveInput = (id, key) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', function () {
            RegState.formData[key] = this.value;
            RegState.save();
        });
    };
    saveInput('userName', 'userName');
    saveInput('productSelect', 'product');

    // 7. 이벤트 바인딩 - 차대번호
    const serialInput = document.getElementById("serialNo");
    const serialCount = document.getElementById("serialCount");
    const serialError = document.getElementById("serialError");
    const stepBadge = document.getElementById("stepBadge");
    const btnCheckSerial = document.getElementById("btnCheckSerial");
    const btnStep2Next = document.getElementById("btnStep2Next");

    if (serialInput) {
        serialInput.addEventListener("input", function (e) {
            const sanitized = Utils.sanitizeNumeric(this.value);
            if (this.value !== sanitized) this.value = sanitized;

            RegState.formData.serialNo = sanitized;
            RegState.save();

            RegState.isSerialVerified = false;
            if (btnStep2Next) {
                btnStep2Next.disabled = true;
                btnStep2Next.innerHTML = '먼저 조회해주세요 <span class="arrow">→</span>';
                btnStep2Next.style.backgroundColor = "var(--p-border)";
                btnStep2Next.style.color = "var(--p-text-ghost)";
                btnStep2Next.style.cursor = "not-allowed";
            }
            if (serialError) serialError.style.display = "none";

            this.classList.add("highlight-input");
            if (stepBadge) stepBadge.style.display = "block";

            if (serialCount) {
                const len = sanitized.length;
                serialCount.innerText = `${len}자`;
                if (len === 0) {
                    serialCount.style.color = "#888"; serialCount.style.fontWeight = "normal";
                } else if (len < 13) {
                    serialCount.style.color = "#e03131"; serialCount.style.fontWeight = "bold";
                } else {
                    serialCount.style.color = "#2f6286"; serialCount.style.fontWeight = "bold";
                }
            }
        });

        serialInput.addEventListener("keypress", function (e) {
            if (e.key === 'Enter') { e.preventDefault(); runSerialCheck(); }
        });
    }

    if (btnCheckSerial) {
        btnCheckSerial.addEventListener("click", runSerialCheck);
    }

    function runSerialCheck() {
        const val = serialInput.value.trim();
        if (val.length < 1) return Utils.showAlert("차대번호를 입력해주세요.");

        serialError.style.display = "block";
        serialError.style.color = "var(--p-primary)";
        serialError.innerText = "확인 중...";
        btnCheckSerial.disabled = true;
        btnCheckSerial.innerText = "...";

        RegAPI.checkSerial(val).then(d => {
            btnCheckSerial.disabled = false;
            btnCheckSerial.innerText = "조회";

            if (d.status === "ok") {
                RegState.isSerialVerified = true;
                serialError.style.color = "var(--p-secondary)";
                serialError.innerText = `✅ 확인되었습니다. (${d.model})`;

                const select = document.getElementById("productSelect");
                if (d.model && select) {
                    select.value = d.model;
                    RegState.formData.product = d.model;
                    RegState.save();
                }

                serialInput.classList.remove("highlight-input");
                if (stepBadge) stepBadge.style.display = "none";

                if (btnStep2Next) {
                    btnStep2Next.disabled = false;
                    btnStep2Next.innerHTML = '인증 완료! 다음 단계로 <span class="arrow">→</span>';
                    btnStep2Next.style.backgroundColor = "var(--p-primary)";
                    btnStep2Next.style.color = "#fff";
                    btnStep2Next.style.cursor = "pointer";
                }
            } else {
                RegState.isSerialVerified = false;
                serialError.style.color = "#e74c3c";
                serialError.innerText = "❌ " + d.message;
                if (btnStep2Next) {
                    btnStep2Next.disabled = true;
                    btnStep2Next.innerHTML = '조회 실패 <span class="arrow">→</span>';
                    btnStep2Next.style.backgroundColor = "var(--p-border)";
                    btnStep2Next.style.color = "var(--p-text-ghost)";
                }
            }
        }).catch(e => {
            btnCheckSerial.disabled = false;
            btnCheckSerial.innerText = "조회";
            serialError.innerText = "서버 통신 오류. 다시 시도해주세요.";
        });
    }

    // 8. 제출 로직
    const submitBtn = document.querySelector(".submit-btn");
    if (submitBtn) {
        submitBtn.addEventListener("click", function () {
            const fileInput = document.getElementById("receiptFile");
            if (!RegValidation.final(fileInput)) return;

            RegUI.setLoadingState(true);
            document.getElementById("waitText").innerText = "잠시만 기다려주세요.";
            window.GLOBAL_RETRY_COUNT = 0;

            const payload = { ...RegState.formData };
            payload.marketingConsent = payload.marketing;
            payload.transferConsent = payload.transfer;

            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = function (e) {
                payload.fileName = file.name;
                payload.mimeType = file.type;
                payload.fileData = e.target.result.split(",")[1];

                RegAPI.submitForm(payload).then(res => {
                    if (res.result === "success") {
                        RegState.clear();
                        Utils.showAlert("✅ 제품 등록이 완료되었습니다!\n등록 내역 확인 페이지로 자동 이동합니다.", function () {
                            window.location.href = "./product_check.html?name=" + encodeURIComponent(payload.userName) + "&phone=" + encodeURIComponent(payload.userPhone);
                        });
                    } else if (res.message.includes("이미 등록된 제품") && window.GLOBAL_RETRY_COUNT > 0) {
                        RegState.clear();
                        Utils.showAlert("✅ (재접속 성공) 제품 등록이 완료되었습니다!\n등록 내역 확인 페이지로 자동 이동합니다.", function () {
                            window.location.href = "./product_check.html?name=" + encodeURIComponent(payload.userName) + "&phone=" + encodeURIComponent(payload.userPhone);
                        });
                    } else {
                        Utils.showAlert("오류 발생: " + res.message);
                        RegUI.setLoadingState(false);
                    }
                }).catch(e => {
                    Utils.showAlert("접속자가 많아 등록에 실패했습니다.\n잠시 후 다시 시도해주세요.");
                    RegUI.setLoadingState(false);
                });
            };
            reader.readAsDataURL(file);
        });
    }

    // 9. 네비게이션
    const topBackBtn = document.getElementById("topBackBtn");
    if (topBackBtn) {
        topBackBtn.addEventListener("click", function (e) {
            e.preventDefault();
            if (RegState.step === 1) {
                location.href = './index.html';
            } else {
                window.nextStep(RegState.step - 1);
            }
        });
    }
});

// 전역 스코프 함수 유지 (HTML 인라인 이벤트 처리를 위함)
window.nextStep = function (targetStep) {
    if (targetStep === 2 && !RegValidation.step1()) return;
    if (targetStep === 3 && !RegValidation.step2()) return;
    RegUI.showStep(targetStep);
}