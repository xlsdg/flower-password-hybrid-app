var txtPwd = null;
var txtKey = null;
var txtCode = null;
var btnCopy = null;
var btnMenu = null;
var lstMenu = null;
var btnUndo = null;
var btnSetting = null;
var btnAbout = null;
var divMain = null;
var divSetting = null;
var divAbout = null;
var divKeys = null;
var lstKeys = null;
var chkAutoSaveKey = null;
var chkCustomSuffix = null;
var chkCustomDigit = null;
var btnClearKey = null;
var LogoAbout = null;
var LogoSetting = null;

var isAutoSaveKey = false;
var NAME_KEYS = 'keys';
var NAME_AUTOSAVEKEY = 'autoSaveKey';
var aryKeys = [];

var isCustomSuffix = false;
var NAME_SUFFIX = 'suffix';
var NAME_CUSTOMSUFFIX = 'customSuffix';
var customSuffix = '';

var isCustomDigit = false;
var NAME_DIGIT = 'digit';
var NAME_CUSTOMDIGIT = 'customDigit';
var customDigit = 16;

// 取消浏览器的所有事件，使得active的样式在手机上正常生效
document.addEventListener('touchstart', function() {
    'use strict';
    return false;
}, true);

// 禁止选择
document.oncontextmenu = function() {
    'use strict';
    return false;
};

document.addEventListener('click', function(event) {
    'use strict';
    hideSomeDivs();
    event.stopPropagation();
}, false);

function hideSomeDivs() {
    divKeys.style.display = 'none';
    lstMenu.style.display = 'none';
}

function backListener() {
    'use strict';
    if (divMain.style.display === 'none') {
        lstMenu.style.display = 'none';
        divMain.style.display = 'block';
        divSetting.style.display = 'none';
        divAbout.style.display = 'none';
        divKeys.style.display = 'none';
    } else {
        plus.runtime.quit();
    }
}

function startBack() {
    'use strict';
    plus.key.addEventListener('backbutton', backListener, false);
}

function stopBack() {
    'use strict';
    plus.key.removeEventListener('backbutton', backListener);
}

function insertKey(key) {
    'use strict';
    var li = document.createElement('li');
    li.innerHTML = key;
    li.onclick = function() {
        txtKey.value = key;
    };
    lstKeys.appendChild(li);
}

function plusReady() {
    'use strict';
    startBack();

    // 隐藏滚动条
    plus.webview.currentWebview().setStyle({scrollIndicator: 'none'});

    isAutoSaveKey = (plus.storage.getItem(NAME_AUTOSAVEKEY) === 'true') ? true : false;
    isCustomSuffix = (plus.storage.getItem(NAME_CUSTOMSUFFIX) === 'true') ? true : false;
    isCustomDigit = (plus.storage.getItem(NAME_CUSTOMDIGIT) === 'true') ? true : false;

    var keys = plus.storage.getItem(NAME_KEYS);
    if (keys) {
        aryKeys = keys.split(',');
        for (var i = 0, aryLen = aryKeys.length; i < aryLen; i++) {
            insertKey(aryKeys[i]);
        }
    }

    customSuffix = plus.storage.getItem(NAME_SUFFIX);
    if (!customSuffix) {
        customSuffix = '';
    }

    customDigit = plus.storage.getItem(NAME_DIGIT);
    if (!customDigit) {
        customDigit = 16;
    }
}

if (window.plus) {
    plusReady();
} else {
    document.addEventListener('plusready', plusReady, false);
}

function showCode() {
    'use strict';
    var password = txtPwd.value;
    var key = txtKey.value;

    if ((password.length < 1) || (key.length < 1)) {
        txtCode.value = '';
        return false;
    }

    if (isCustomSuffix) {
        key = key + customSuffix;
    }

    var code = '';
    if (isCustomDigit) {
        if (6 > customDigit || customDigit > 32) {
            customDigit = 16;
            plus.storage.setItem(NAME_DIGIT, customDigit.toString());
        }
        code = fpCode(password, key, customDigit);
    } else {
        code = fpCode(password, key, 16);
    }

    txtCode.value = code;
}

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    txtPwd = document.getElementById('txt-password');
    txtKey = document.getElementById('txt-key');
    txtCode = document.getElementById('txt-code');
    btnCopy = document.getElementById('btn-copy');
    btnMenu = document.getElementById('btn-menu');
    lstMenu = document.getElementById('lst-menu');
    btnUndo = document.getElementById('btn-undo');
    btnSetting = document.getElementById('btn-setting');
    btnAbout = document.getElementById('btn-about');
    divMain = document.getElementById('page-main');
    divSetting = document.getElementById('page-setting');
    divAbout = document.getElementById('page-about');
    divKeys = document.getElementById('div-keys');
    lstKeys = document.getElementById('lst-keys');
    chkAutoSaveKey = document.getElementById('chk-autosave-key');
    chkCustomSuffix = document.getElementById('chk-custom-suffix');
    chkCustomDigit = document.getElementById('chk-custom-digit');
    btnClearKey = document.getElementById('btn-clear-key');
    LogoAbout = document.getElementById('logo-about');
    LogoSetting = document.getElementById('logo-setting');

    txtPwd.onchange = showCode;
    txtKey.onchange = showCode;
    txtPwd.onkeyup = showCode;
    txtKey.onkeyup = showCode;
    txtPwd.onblur = showCode;
    txtKey.onblur = showCode;

    btnCopy.addEventListener('click', function(event) {
        hideSomeDivs();

        if (txtCode.value.length > 0) {
            var os = plus.os.name;
            var key = txtKey.value;
            var strKey = aryKeys.join(',');

            if (isAutoSaveKey) {
                if (strKey.toLowerCase().indexOf(key.toLowerCase()) === -1) {
                    aryKeys.push(key);
                    insertKey(key);
                    plus.storage.setItem(NAME_KEYS, strKey);
                }
            }

            if (os.toLowerCase().indexOf('android') !== -1) {
                var Context = plus.android.importClass('android.content.Context');
                var main = plus.android.runtimeMainActivity();
                var clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
                plus.android.invoke(clip, 'setText', txtCode.value);
            } else {
                var UIPasteboard = plus.ios.importClass('UIPasteboard');
                var generalPasteboard = UIPasteboard.generalPasteboard();
                generalPasteboard.setValueforPasteboardType(txtCode.value, 'public.utf8-plain-text');
                // var value = generalPasteboard.valueForPasteboardType('public.utf8-plain-text');
            }
            plus.nativeUI.toast('复制成功');
        }
        event.stopPropagation();
    }, false);

    btnMenu.addEventListener('click', function(event) {
        lstMenu.style.display = (lstMenu.style.display === 'none') ? 'block' : 'none';
        event.stopPropagation();
    }, false);

    btnSetting.addEventListener('click', function(event) {
        lstMenu.style.display = 'none';
        divMain.style.display = 'none';
        divSetting.style.display = 'block';
        divAbout.style.display = 'none';
        divKeys.style.display = 'none';

        chkAutoSaveKey.checked = isAutoSaveKey;
        chkCustomSuffix.checked = isCustomSuffix;
        chkCustomDigit.checked = isCustomDigit;

        event.stopPropagation();
    }, false);

    btnAbout.addEventListener('click', function(event) {
        lstMenu.style.display = 'none';
        divMain.style.display = 'none';
        divSetting.style.display = 'none';
        divAbout.style.display = 'block';
        divKeys.style.display = 'none';
        event.stopPropagation();
    }, false);

    btnUndo.addEventListener('click', function(event) {
        hideSomeDivs();

        txtPwd.value = '';
        txtKey.value = '';
        txtCode.value = '';
        plus.nativeUI.toast('清空成功');
        event.stopPropagation();
    }, false);

    chkAutoSaveKey.addEventListener('click', function(event) {
        isAutoSaveKey = chkAutoSaveKey.checked;
        plus.storage.setItem(NAME_AUTOSAVEKEY, isAutoSaveKey.toString());
        event.stopPropagation();
    }, false);

    chkCustomSuffix.addEventListener('click', function(event) {
        if (chkCustomSuffix.checked) {
            plus.nativeUI.prompt('请输入附加扰码：', function(event) {
                if (event.index === 0) {
                    isCustomSuffix = true;
                    var tmpSuffix = event.value;
                    if (tmpSuffix && (tmpSuffix.length > 0)) {
                        customSuffix = tmpSuffix;
                        plus.storage.setItem(NAME_SUFFIX, customSuffix.toString());
                    }
                } else {
                    isCustomSuffix = false;
                }
                chkCustomSuffix.checked = isCustomSuffix;
                plus.storage.setItem(NAME_CUSTOMSUFFIX, isCustomSuffix.toString());
            }, '花密', '已设附加扰码：' + customSuffix, ['确定', '取消']);
        } else {
            isCustomSuffix = false;
            chkCustomSuffix.checked = isCustomSuffix;
            plus.storage.setItem(NAME_CUSTOMSUFFIX, isCustomSuffix.toString());
        }
        event.stopPropagation();
    }, false);

    chkCustomDigit.addEventListener('click', function(event) {
        if (chkCustomDigit.checked) {
            plus.nativeUI.prompt('请输入生成密码位数(6~32)：', function(event) {
                if (event.index === 0) {
                    isCustomDigit = true;
                    var tmpDigit = event.value;
                    if (tmpDigit && (tmpDigit.length > 0)) {
                        if (tmpDigit < 6) {
                            tmpDigit = 6;
                        }
                        if (tmpDigit > 32) {
                            tmpDigit = 32;
                        }
                        customDigit = tmpDigit;
                        plus.storage.setItem(NAME_DIGIT, customDigit.toString());
                    }
                } else {
                    isCustomDigit = false;
                }
                chkCustomDigit.checked = isCustomDigit;
                plus.storage.setItem(NAME_CUSTOMDIGIT, isCustomDigit.toString());
                showCode();
            }, '花密', '已设密码位数：' + customDigit, ['确定', '取消']);
        } else {
            isCustomDigit = false;
            chkCustomDigit.checked = isCustomDigit;
            plus.storage.setItem(NAME_CUSTOMDIGIT, isCustomDigit.toString());
            showCode();
        }
        event.stopPropagation();
    }, false);

    btnClearKey.addEventListener('click', function(event) {
        aryKeys = [];
        plus.nativeUI.toast('清空区分代号成功');
        // lstKeys.innerHTML = '';
        var child = lstKeys.childNodes;
        if (child) {
            for (var i = 0, len = child.length; i < len; i++) {
                lstKeys.removeChild(child[0]);
            }
        }

        plus.storage.setItem(NAME_KEYS, aryKeys.join(','));
        event.stopPropagation();
    }, false);

    txtKey.addEventListener('click', function(event) {
        hideSomeDivs();

        if (aryKeys.length > 0) {
            switch (aryKeys.length) {
                case 1:
                    {
                        divKeys.style.height = '82px';
                        break;
                    }
                case 2:
                    {
                        divKeys.style.height = '164px';
                        break;
                    }
                default:
                    {
                        divKeys.style.height = '246px';
                    }
            }
            divKeys.style.display = (divKeys.style.display === 'none') ? 'block' : 'none';
        }
        event.stopPropagation();
    }, false);

    LogoAbout.addEventListener('click', function(event) {
        if (divMain.style.display === 'none') {
            lstMenu.style.display = 'none';
            divMain.style.display = 'block';
            divSetting.style.display = 'none';
            divAbout.style.display = 'none';
            divKeys.style.display = 'none';
        }
        event.stopPropagation();
    }, false);
    
    LogoSetting.addEventListener('click', function(event) {
        if (divMain.style.display === 'none') {
            lstMenu.style.display = 'none';
            divMain.style.display = 'block';
            divSetting.style.display = 'none';
            divAbout.style.display = 'none';
            divKeys.style.display = 'none';
        }
        event.stopPropagation();
    }, false);
    
});
