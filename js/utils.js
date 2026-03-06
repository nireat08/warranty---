const Utils = {
    MAX_FILE_SIZE: 3 * 1024 * 1024,

    showAlert: function (message, callback) {
        const modal = document.getElementById('systemAlert');
        const msgBox = document.getElementById('systemAlertMsg');
        const btn = document.getElementById('systemAlertBtn');
        if (modal && msgBox && btn) {
            msgBox.innerHTML = message.replace(/\n/g, "<br>");
            modal.style.display = 'flex';
            btn.onclick = function () { modal.style.display = 'none'; if (callback) callback(); };
        } else {
            alert(message);
            if (callback) callback();
        }
    },

    formatPhone: function (val) {
        let v = val.replace(/[^0-9]/g, '');
        if (v.length > 3 && v.length <= 7) v = v.slice(0, 3) + "-" + v.slice(3);
        else if (v.length > 7) v = v.slice(0, 3) + "-" + v.slice(3, 7) + "-" + v.slice(7);
        return v.slice(0, 13);
    },

    sanitizeNumeric: function (val) {
        return val.replace(/[^0-9]/g, '');
    }
};
