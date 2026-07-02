// ==========================================
// 統一共用模組 (travel.js)
// ==========================================

// 1. 動態取得目前頁面的專屬 ID 與匯率
function getTripConfig() {
    const mainContent = document.querySelector('.content');
    return {
        id: mainContent ? (mainContent.getAttribute('data-trip-id') || 'default_trip') : 'default_trip',
        rate: mainContent ? (parseFloat(mainContent.getAttribute('data-currency-rate')) || 1) : 1
    };
}

// ==========================================
// 全局功能函數 (綁定在 window 上確保 HTML 可點擊)
// ==========================================

// 切換左側選單與頁面
window.showPage = function(pageId) {
    // 隱藏所有頁面
    document.querySelectorAll('.page-section').forEach(page => page.classList.remove('active'));
    
    // 顯示目標頁面
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');

    // 切換選單的亮起狀態 (Active)
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(pageId)) {
            item.classList.add('active');
        }
    });
    
    // 滾動到最上方並記憶最後觀看頁面
    window.scrollTo(0, 0); 
    const config = getTripConfig();
    localStorage.setItem(`${config.id}_last_page`, pageId);
};

// 匯率換算
window.convertCurrency = function(amount) {
    const config = getTripConfig();
    const resultBox = document.getElementById('twdResult');
    if (!amount || !resultBox) {
        if(resultBox) resultBox.innerText = "NT$ 0";
        return;
    }
    const twd = Math.round(amount * config.rate);
    resultBox.innerText = "NT$ " + twd;
};

// 清除匯率
window.clearCurrency = function() {
    const calcInput = document.getElementById('calcInput');
    const resultBox = document.getElementById('twdResult');
    if(calcInput) calcInput.value = '';
    if(resultBox) resultBox.innerText = "NT$ 0";
};

// 購物清單打勾特效
window.toggleBought = function(checkbox) {
    const config = getTripConfig();
    const itemCard = checkbox.closest('.shop-item');
    if (checkbox.checked) {
        itemCard.classList.add('bought');
    } else {
        itemCard.classList.remove('bought');
    }
    
    // 存入快取記憶體
    const checks = [];
    document.querySelectorAll('.shop-check').forEach(cb => checks.push(cb.checked));
    localStorage.setItem(`${config.id}_checks`, JSON.stringify(checks));
};

// 儲存購物備忘錄
window.saveMemo = function(text) {
    const config = getTripConfig();
    localStorage.setItem(`${config.id}_memo`, text);
};

// 圖片燈箱：打開
window.openImage = function(imgElement) {
    const lightbox = document.getElementById('myLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    if(lightbox && lightboxImg) {
        lightboxImg.src = imgElement.src;
        lightbox.style.display = 'flex';
        lightboxImg.classList.remove('zoomed');
    }
};

// 圖片燈箱：關閉
window.closeLightbox = function(event) {
    if (event && event.target.id === 'lightboxImg') return;
    const lightbox = document.getElementById('myLightbox');
    if(lightbox) lightbox.style.display = 'none';
};

// 圖片燈箱：放大縮小
window.toggleZoom = function(event) {
    if(event) event.stopPropagation();
    const img = document.getElementById('lightboxImg');
    if(img) img.classList.toggle('zoomed');
};

// ==========================================
// 網頁載入時自動執行的初始化 (還原進度)
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const config = getTripConfig();

    // 1. 恢復上次瀏覽的頁面
    const lastPage = localStorage.getItem(`${config.id}_last_page`);
    if (lastPage && document.getElementById(lastPage)) {
        window.showPage(lastPage);
    } else {
        const firstPage = document.querySelector('.page-section');
        if(firstPage) window.showPage(firstPage.id);
    }

    // 2. 恢復「購物備忘錄」內容
    const savedText = localStorage.getItem(`${config.id}_memo`);
    const memoBox = document.getElementById('shopMemo');
    if (savedText && memoBox) {
        memoBox.value = savedText;
    }

    // 3. 恢復「購物清單勾選」狀態
    const savedChecksStr = localStorage.getItem(`${config.id}_checks`);
    if (savedChecksStr) {
        try {
            const savedChecks = JSON.parse(savedChecksStr);
            const checkboxes = document.querySelectorAll('.shop-check');
            checkboxes.forEach((cb, index) => {
                if (savedChecks[index]) {
                    cb.checked = true;
                    cb.closest('.shop-item').classList.add('bought');
                }
            });
        } catch(e) {}
    }
});