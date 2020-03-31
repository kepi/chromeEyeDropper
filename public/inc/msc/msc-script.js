(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        var expData = factory();
        for(var key in expData) {
            if (expData.hasOwnProperty(key)) {
                root[key] = expData[key];
            }
        }
  }
}(this, function(){
    function ce(tag, clas, txt) {
        var ele = document.createElement(tag);
        ele.setAttribute('class', clas);
        if(typeof txt === 'undefined' || txt === null){
            return ele;
        }
        var tn = document.createTextNode(txt);
        ele.appendChild(tn);
        return ele;
    }
    var KEY_ESC = 27;
    var KEY_ENTER = 13;

    function buildUI(title, sub, onOk, onCancel, type) {
        if (typeof window === 'undefined') {
            throw 'Cannot use this in node.';
        }
        var prev = document.getElementsByClassName('msc-confirm');
        if(prev.length > 0){
            document.body.removeChild(prev[0]);
        }

        var options = {
            title: 'Confirm',
            subtitle: '',
            onOk: null,
            onCancel: null,
            okText: 'OK',
            cancelText: 'Cancel',
            placeholder: 'Enter value',
            dismissOverlay: false,
            defaultValue: ''
        };

        if(typeof title === 'object') {
            for(var key in title) {
                options[key] = title[key];
            }
            if(typeof options.onOk !== 'function') {
                options.onOk = null;
            }
            if(typeof options.onCancel !== 'function') {
                options.onCancel = null;
            }
        } else {
            options.title = (typeof title === 'string') ? title : options.title;
            options.subtitle = (typeof sub === 'string') ? sub : options.subtitle;
            options.onOk = (typeof onOk === 'function') ? onOk : options.onOk;
            options.onCancel = (typeof onCancel === 'function') ? onCancel : options.onCancel;

            if(typeof sub === 'function') {
                options.onOk = sub;
            }
        }

        var dialog = ce('div', 'msc-confirm'),
            overlay = ce('div', 'msc-overlay'),
            closeBtn = ce('button', 'msc-close');
        closeBtn.innerHTML = '&times;';
        overlay.appendChild(closeBtn);

        if(options.dismissOverlay) {
            overlay.addEventListener("click", destroy);
        }

        closeBtn.addEventListener('click', destroy);

        var content = ce('div', 'msc-content'),
            cTitle = ce('h3', 'msc-title', options.title),
            body = ce('div', 'msc-body'),
            action = ce('div', 'msc-action'),
            okBtn = ce('button', 'msc-ok', options.okText),
            cancelbtn = ce('button', 'msc-cancel', options.cancelText),
            input = ce('input', 'msc-input');

        body.appendChild(ce('p','msc-sub', options.subtitle));

        action.appendChild(okBtn);
        if(type !== "alert") {
            action.appendChild(cancelbtn);
            cancelbtn.addEventListener('click', cancel);
        }

        okBtn.addEventListener('click', ok);

        content.appendChild(cTitle);
        content.appendChild(body);
        content.appendChild(action);

        dialog.appendChild(overlay);
        dialog.appendChild(content);
        document.body.appendChild(dialog);
        dialog.style.display = 'block';
        content.classList.add('msc-confirm--animate');
        if(type === "prompt") {
            input.setAttribute("type", "text");
            input.setAttribute("placeholder", options.placeholder);
            input.value = options.defaultValue;
            input.addEventListener("keyup", function(e) {
                if(e.keyCode === KEY_ENTER) {
                    ok();
                }
            });
            body.appendChild(input);
            input.focus();
        }else if(type==="alert") {
            okBtn.focus();
        }else {
            cancelbtn.focus();
        }

        document.addEventListener('keyup', _hide);

        function destroy() {
            closeBtn.removeEventListener('click', destroy);
            okBtn.removeEventListener('click', ok);
            cancelbtn.removeEventListener('click', cancel);
            if(options.dismissOverlay) {
                overlay.removeEventListener("click", destroy);
            }
            document.removeEventListener('keyup', _hide);
            document.body.removeChild(dialog);
        }

        function ok() {
            destroy();
            if(options.onOk !== null) {
                if(type === "prompt") {
                    options.onOk(input.value);
                }else {
                    options.onOk();
                }
            }
        }

        function cancel() {
            destroy();
            if(options.onCancel !== null) {
                options.onCancel();
            }
        }

        function _hide(e) {
            if(e.keyCode == 27) {
                destroy();
            }
        }
    };
    var exportData = {
        mscConfirm: function(title, sub, onOk, onCancel) {
            buildUI(title, sub, onOk, onCancel, "confirm");
        },
        mscPrompt: function(title, sub, onOk, onCancel) {
            buildUI(title, sub, onOk, onCancel, "prompt");
        },
        mscAlert: function(title, sub, onOk, onCancel) {
            buildUI(title, sub, onOk, onCancel, "alert");
        },
        mscClose: function() {
            var prev = document.getElementsByClassName('msc-confirm');
            if(prev.length > 0){
                document.body.removeChild(prev[0]);
            }
        }
    };
    return exportData;
}));
