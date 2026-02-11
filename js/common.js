/**
 * 퀄리스포츠 제품 등록 서비스 - 공통 스크립트
 * 모든 페이지에서 공통적으로 사용되는 상수와 함수를 정의합니다.
 */

// API URL 상수화 (한 곳에서 관리)
const API_URL = "https://script.google.com/macros/s/AKfycbyy02EOo87dG4BWco1kbLO3O9BXwFSUKy-olHVwUim_E_07Azl5tl-e40UO1uBqoyeJ/exec";

// [보안] 서버(GAS)와 약속된 비밀 토큰 (GAS 코드의 API_TOKEN과 일치해야 함)
const API_TOKEN = "QUALI_SECRET_TOKEN_2026"; 

// 모달 제어 함수
function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'flex';
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

// Fetch Wrapper (재시도 로직 및 토큰 자동 첨부 포함)
async function fetchWithRetry(url, options = {}, retries = 3, backoff = 1000) {
    // URL에 보안 토큰 자동 추가 로직
    let requestUrl = url;
    if (!requestUrl.includes("token=")) {
        const separator = requestUrl.includes('?') ? '&' : '?';
        requestUrl = requestUrl + separator + "token=" + API_TOKEN;
    }

    try {
        const response = await fetch(requestUrl, options);
        if (!response.ok) throw new Error("Server Busy");
        const json = await response.json();
        return json;
    } catch (error) {
        if (retries > 0) {
            const waitText = document.getElementById("waitText");
            if (waitText) waitText.innerText = `접속량이 많아 대기 중입니다... (${retries})`;
            
            // 글로벌 카운트 변수가 있다면 업데이트 (등록페이지용)
            if (window.GLOBAL_RETRY_COUNT !== undefined) {
                window.GLOBAL_RETRY_COUNT++;
                if(waitText) waitText.innerText = `접속량이 많아 대기 중입니다... (${window.GLOBAL_RETRY_COUNT}회 재시도)`;
            }

            await new Promise(resolve => setTimeout(resolve, backoff));
            // 재귀 호출 시에는 원본 url을 넘김 (requestUrl은 함수 내에서 다시 생성됨)
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        } else {
            throw error;
        }
    }
}

// 보안 및 우클릭 방지 (문서 로드 시 자동 실행)
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener("contextmenu", e => e.preventDefault());
    document.addEventListener("dragstart", e => e.preventDefault());
    document.addEventListener("selectstart", e => e.preventDefault());
    
    document.addEventListener('keydown', function(e) {
        if (e.keyCode === 123 || 
            (e.ctrlKey && e.shiftKey && e.keyCode === 73) || 
            (e.ctrlKey && e.keyCode === 85)) {
            e.preventDefault();
            return false;
        }
    });
});