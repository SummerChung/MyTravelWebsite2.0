// --- 系統設定 ---
const config = {
    home: { city: "台北", lat: 25.03, lng: 121.56, icon: '<i class="fas fa-home"></i>' },
    globe: { autoRotateSpeed: 0.8, flyDuration: 1000, viewAltitude: 2.2, focusAltitude: 2.0 },
    anim: { fadeOut: 250, slideIn: 300 }
};

// --- 旅遊資料庫 ---
const travelData = [
    {
        id: "seoul2028",
        city: "首爾",
        country: "韓國",
        countryEn: "South Korea",
        countryCode: "KR",
        flag: "🇰🇷",
        lat: 37.56,
        lng: 126.99,
        start: "2028-03-22",
        end: "2028-03-26",
        days: 5,
        title: "首爾 5 天 4 夜",
        subtitle: "春季賞櫻購物",
        page: "Seoul2028.html"
    },
    {
        id: "tokyo2027",
        city: "東京",
        country: "日本",
        countryEn: "Japan",
        countryCode: "JP",
        flag: "🇯🇵",
        lat: 35.68,
        lng: 139.76,
        start: "2027-11-18",
        end: "2027-11-23",
        days: 6,
        title: "東京 6 天 5 夜",
        subtitle: "賞楓與聖誕點燈",
        page: "Tokyo2027.html"
    },
    {
        id: "bangkok2027",
        city: "曼谷",
        country: "泰國",
        countryEn: "Thailand",
        countryCode: "TH",
        flag: "🇹🇭",
        lat: 13.75,
        lng: 100.50,
        start: "2027-02-26",
        end: "2027-03-01",
        days: 5,
        title: "曼谷 5 天 4 夜",
        subtitle: "避寒泰式按摩",
        page: "Bangkok2027.html"
    },
    {
        id: "fukuoka2026",
        city: "福岡",
        country: "日本",
        countryEn: "Japan",
        countryCode: "JP",
        flag: "🇯🇵",
        lat: 33.59,
        lng: 130.40,
        start: "2026-06-18",
        end: "2026-06-21",
        days: 4,
        title: "福岡 4 天 3 夜",
        subtitle: "👶🏻生日旅行",
        page: "Fukuoka2026.html"
    },
    {
        id: "okinawa2025",
        city: "沖繩",
        country: "日本",
        countryEn: "Japan",
        countryCode: "JP",
        flag: "🇯🇵",
        lat: 26.21,
        lng: 127.68,
        start: "2025-12-25",
        end: "2025-12-28",
        days: 4,
        title: "沖繩 4 天 3 夜",
        subtitle: "美麗海與聖誕節",
        page: "Okinawa2025.html"
    },
    {
        id: "hongkong2025",
        city: "香港",
        country: "香港",
        countryEn: "Hong Kong",
        countryCode: "HK",
        flag: "🇭🇰",
        lat: 22.31,
        lng: 114.16,
        start: "2025-06-13",
        end: "2025-06-15",
        days: 3,
        title: "香港 3 天 2 夜",
        subtitle: "百萬夜景生日",
        page: "HongKong2025.html"
    },
    {
        id: "seoul2025",
        city: "首爾",
        country: "韓國",
        countryEn: "South Korea",
        countryCode: "KR",
        flag: "🇰🇷",
        lat: 37.56,
        lng: 126.99,
        start: "2025-01-30",
        end: "2025-02-03",
        days: 5,
        title: "首爾 5 天 4 夜",
        subtitle: "週年雪景之旅",
        page: "Seoul2025.html"
    }
];

// --- 共用模組與函式庫 (TravelUtils) ---
const TravelUtils = {
    _cachedAll: null,
    _cachedUpcoming: null,
    _cachedCompleted: null,

    // 1. 取得所有旅程 (依開始日期：新 -> 舊排序) - 用於 All Trips、City Panel、Travel Map
    getAllTrips: function() {
        if (!this._cachedAll) {
            this._cachedAll = [...travelData].sort((a, b) => new Date(b.start) - new Date(a.start));
        }
        return this._cachedAll;
    },

    // 2. 取得未來尚未開始的旅程 (依開始日期：舊 -> 新排序，用於首頁 Upcoming 卡片)
    getUpcomingTrips: function() {
        if (!this._cachedUpcoming) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const future = this.getAllTrips().filter(t => new Date(t.end) >= today);
            this._cachedUpcoming = future.sort((a, b) => new Date(a.start) - new Date(b.start));
        }
        return this._cachedUpcoming;
    },

    // 3. 取得已完成的旅程 (保留供未來統計等功能擴充使用)
    getCompletedTrips: function() {
        if (!this._cachedCompleted) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const past = this.getAllTrips().filter(t => new Date(t.end) < today);
            this._cachedCompleted = past.sort((a, b) => new Date(b.start) - new Date(a.start));
        }
        return this._cachedCompleted;
    },

    // 4. 自動化判斷旅程狀態 (回傳文字與對應 CSS 類別)
    getTripStatus: function(t) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const s = new Date(t.start);
        const e = new Date(t.end);
        
        if (today > e) {
            return { text: 'Completed', class: 'status-completed' };
        }
        if (today >= s && today <= e) {
            return { text: 'Traveling', class: 'status-traveling' };
        }
        
        const diffDays = Math.ceil((s - today) / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) {
            return { text: 'Upcoming', class: 'status-upcoming' };
        }
        return { text: 'Planning', class: 'status-planning' };
    },

    // 5. 計算距離出發還剩幾天
    getDaysUntil: function(dateStr) {
        const target = new Date(dateStr);
        target.setHours(0,0,0,0);
        const today = new Date();
        today.setHours(0,0,0,0);
        return Math.max(0, Math.ceil((target - today) / (1000 * 60 * 60 * 24)));
    },

    // 6. 格式化日期：YYYY/MM/DD - MM/DD
    formatTripDate: function(startStr, endStr) {
        const s = new Date(startStr);
        const e = new Date(endStr);
        const pad = num => String(num).padStart(2, '0');
        return `${s.getFullYear()}/${pad(s.getMonth()+1)}/${pad(s.getDate())} - ${pad(e.getMonth()+1)}/${pad(e.getDate())}`;
    },

    // 7. 產生共用卡片 HTML
    generateTripCard: function(t, isArchive = false) {
        const statusObj = this.getTripStatus(t);
        const dateStr = this.formatTripDate(t.start, t.end);
        
        let infoHtml = '';
        let arrowHtml = '';

        if (isArchive) {
            infoHtml = `
                <div class="trip-subtitle">
                    <span><i class="fas fa-map-marker-alt" style="color:#ccc; margin-right:4px;"></i>${t.subtitle}</span>
                    <div style="display:flex; gap:6px;">
                        <span class="country-tag">${t.days} Days</span>
                        <span class="country-tag">${t.countryEn}</span>
                    </div>
                </div>
            `;
            arrowHtml = `<i class="fas fa-angle-right" style="float:right; color:#E6E2D6; margin-top:5px;"></i>`;
        } else {
            infoHtml = `<div class="trip-info"><i class="fas fa-map-marker-alt"></i> ${t.city} • ${t.subtitle}</div>`;
            arrowHtml = `<span class="arrow"><i class="fas fa-chevron-right"></i></span>`;
        }

        return `
            <a href="${t.page}" class="trip-card">
                <div class="trip-header">
                    <div class="trip-date">${dateStr}</div>
                    <div class="trip-status ${statusObj.class}">${statusObj.text}</div>
                </div>
                <div class="trip-title">${t.flag} ${t.title} ${arrowHtml}</div>
                ${infoHtml}
            </a>
        `;
    }
};