$(function () { $('[data-toggle="tooltip"]').tooltip() })
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    loader.style.display = 'none'
})
const POST_DATA2 = async (url = '', data, method = '') => {
    const response = await fetch(url, { method: method, headers: { "Content-Type": "Application/json" }, body: JSON.stringify(data) })
    return response.json()
}
const CUSTOM_ALERTS = (TP, title = '', txt) => { if (TP === 'success') { swal({ title: title, text: txt, icon: TP, button: "GOT IT" }); return } else if (TP === 'warning') { swal({ title: title, text: txt, icon: TP, button: "GOT IT", }) } else if (TP === 'DangerMode') { swal({ title: 'Are You Sure ?', text: "Are Sure wanna Unblock This User ? ", icon: "warning", buttons: !0, dangerMode: !0, }).then((willDelete) => { if (willDelete) { swal(txt, { icon: "success", }); return } }) } else { return null } }
const BASE_URL = 'https://short-url-snaplink.herokuapp.com';
const alertWarning = document.getElementById('alert_warn')
const alertDanger = document.getElementById('alert_danger');
const validator = { isEmpty(str) { if (str.trim() === '') { return !0 } else { return !1 } }, isEmail(email) { const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/; if (email.match(emailPattern)) { return !0 } else { return !1 } }, isLength(str, lng) { if (str.length < lng) { return !0 } else { return !1 } } }
const btns = document.getElementsByClassName('cpy-btn');
let arr = [...btns];
arr.map(btn => {
    btn.addEventListener('click', (e) => {
        const inp = e.target.parentElement.firstElementChild;
        inp.select();
        inp.setSelectionRange(0, 9999);
        document.execCommand('copy');
        swal({ title: 'URL copied!', text: 'URL Has Been Copied Successfullu 100%', icon: 'success', button: "GOT IT" })
    })
})
const urls = document.getElementsByClassName('url');
let urlStack = [...urls];
urlStack.map(url => {
    let str = url.innerText;

    function truncTxt(str, n) { url.innerHTML = str.length > n ? str.substr(0, n) + '***' : str };
    truncTxt(str, 30)
})
const titles = document.getElementsByClassName('art_title');
const desc = document.getElementsByClassName('art_desc');
const arr_obj = { titles: [...titles], desc: [...desc] }
arr_obj.titles.map(title => {
    let title_str = title.innerText;

    function trunc_title(str, n) { title.innerHTML = str.length > n ? str.substr(0, n) + '***' : str };
    trunc_title(title_str, 20)
})
arr_obj.desc.map(desc => {
    let desc_str = desc.innerText;

    function trunc_desc(str, n) { desc.innerHTML = str.length > n ? str.substr(0, n) + '***' : str };
    trunc_desc(desc_str, 50)
})
const signupBtn = document.querySelector('.signup-btn');
const formArea = document.getElementById('user-signup');
$('#user-signup').submit(async (e) => {
    e.preventDefault();
    signupBtn.style.opacity = 0.4;
    signupBtn.innerText = 'Creating...';
    const unindexed__arr = $('#user-signup').serializeArray();
    let data = {};
    $.map(unindexed__arr, function (n, i) { data[n.name] = n.value });
    const captcha = $('#g-recaptcha-response').val();
    data.captcha = captcha;
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9]{2,4}$/;
    if (!validator.isEmail(data.email) || !data.email.match(pattern)) { return alert('Email Field Must Be Valid!') }
    if (validator.isLength(data.password, 6)) { return alert('Password Length is Short! Must be More than 6 characters!') }
    if (validator.isLength(data.username, 6)) { return alert('Username is too short! Must be more than 6 characters') }
    await fetch(`${BASE_URL}/api/register`, { method: 'POST', headers: { 'Content-Type': 'Application/json' }, body: JSON.stringify(data) }).then(response => response.json()).then(data => {
        signupBtn.style.opacity = 1;
        signupBtn.innerText = 'Sign up';
        console.log(data);
        if (data.responseCode === 1) {
            if (data.confirmation === 'warning') {
                alertWarning.classList.add('show_warning');
                setTimeout(() => { alertWarning.classList.remove('show_warning') }, 5000);
                return
            }
            alertDanger.classList.add('show_danger');
            setTimeout(() => { alertDanger.classList.remove('show_danger') }, 5000)
            return
        }
        if (data.message.status === 'exist') {
            formArea.insertAdjacentHTML('afterbegin', `<p class="alert_block_bx">${data['message'].msg}</p>`);
            setTimeout(() => { return formArea.insertAdjacentHTML('afterbegin', '') }, 2000)
        } else if (data.status === 400) {
            alert(data.msg);
            formArea.insertAdjacentHTML('afterbegin', `<p class="alert_block_bx">${data['message'].msg}</p>`);
            return
        } else { formArea.insertAdjacentHTML('afterbegin', `<p class="success_block_bx">${data['message'].msg}</p>`) }
    })
})
const loginBtn = document.querySelector('.login-btn');
const signupForm = document.getElementById('user-login');
$('#user-login').submit((e) => {
    e.preventDefault();
    loginBtn.style.opacity = 0.4;
    loginBtn.innerText = 'Login...';
    loginBtn.style.cursor = 'not-allowed';
    const unindexed__arr = $('#user-login').serializeArray();
    let data = {};
    $.map(unindexed__arr, function (n, i) { data[n.name] = n.value });
    const captcha = $('#g-recaptcha-response').val();
    data.captcha = captcha;
    fetch(`${BASE_URL}/api/login`, { method: "POST", headers: { "Content-Type": "Application/json" }, body: JSON.stringify(data) }).then(response => response.json()).then(data => {
        loginBtn.style.opacity = 1;
        loginBtn.innerText = 'login';
        loginBtn.style.cursor = 'pointer';
        if (data.responseCode === 1) {
            if (data.confirmation === 'warning') {
                alertWarning.classList.add('show_warning');
                setTimeout(() => { alertWarning.classList.remove('show_warning') }, 5000);
                return
            }
            alertDanger.classList.add('show_danger');
            setTimeout(() => { alertDanger.classList.remove('show_danger') }, 5000)
        }
        if (data.status === 302) {
            // ASSIGN UID AS COOKIE
            const UID = data.uid;
            document.cookie = "UID=" + UID;
            window.location = '/verify_Token';
        } else if (data.status === 200) {
            signupForm.insertAdjacentHTML('afterbegin', `<p class="success_block_bx">Successfuly Login</p>`);
            window.location = '/short-url'
        } else if (data.status === 429) {
            swal({
                title: 'Warning!',
                text: data.msgError,
                icon: "warning",
                button: "I Got It",
            });
            //signupForm.insertAdjacentHTML('afterbegin', `<p class="warning_block_bx">${data.msgError}</p>`)
        } else if (data.status === 400) { signupForm.insertAdjacentHTML('afterbegin', `<p class="alert_block_bx">${data.message}</p>`) } else if (data.status === 401) { signupForm.insertAdjacentHTML('afterbegin', `<p class="alert_block_bx">${data.message}</p>`) } else { signupForm.insertAdjacentHTML('afterbegin', `<p style="color:red">Something Went Wrong!</p>`) }
    })
})
const adminFormLogin = document.getElementById('admin-login');
$('#admin-login').submit((e) => {
    e.preventDefault();
    loginBtn.style.opacity = 0.4;
    loginBtn.innerText = 'Login...';
    loginBtn.style.cursor = 'not-allowed';
    const unindexed__arr = $('#admin-login').serializeArray();
    let data = {};
    $.map(unindexed__arr, function (n, i) { data[n.name] = n.value });
    const captcha = $('#g-recaptcha-response').val();
    data.captcha = captcha;
    fetch(`${BASE_URL}${atob('L2FwaS9hZG1pbi9sb2dpbg==')}`, { method: "POST", headers: { "Content-Type": "Application/json" }, body: JSON.stringify(data) }).then(response => response.json()).then(data => {
        loginBtn.style.opacity = 1;
        loginBtn.innerText = 'login';
        loginBtn.style.cursor = 'pointer';
        if (data.responseCode === 1) {
            if (data.confirmation === 'warning') {
                alertWarning.classList.add('show_warning');
                setTimeout(() => { alertWarning.classList.remove('show_warning') }, 5000);
                return
            }
            alertDanger.classList.add('show_danger');
            setTimeout(() => { alertDanger.classList.remove('show_danger') }, 5000)
        }
        if (data.status === 200) {
            adminFormLogin.insertAdjacentHTML('afterbegin', `<p class="success_block_bx">Successfuly Login</p>`);
            window.location = '/admin-panel'
        } else if (data.status === 400) { adminFormLogin.insertAdjacentHTML('afterbegin', `<p class="alert_block_bx">${data.msg}</p>`) } else { adminFormLogin.insertAdjacentHTML('afterbegin', `<p class="alert_block_bx">${data.msg}</p>`); return }
    })
})
const REMOVE_BTNS = document.getElementsByClassName('remove-btn');
const unindexed__btns__arr = [...REMOVE_BTNS];
unindexed__btns__arr.map(btn => {
    btn.addEventListener('click', () => {
        const data_id = btn.getAttribute('data-id');
        swal({ title: "Are you sure?", text: "Once deleted, you will not be able to recover this imaginary file!", icon: "warning", buttons: !0, dangerMode: !0, }).then((willDelete) => {
            if (willDelete) {
                POST_DATA2(`${BASE_URL}${atob('L2FkbWluL2FwaS92MS9yZW1vdmU=')}`, { id: data_id }, 'POST').then(data => {
                    if (!data) { return alert('Server Response Empty!') }
                    if (data.status === 200) {
                        const TD_ELE = btn.parentElement.parentElement;
                        TD_ELE.parentNode.removeChild(TD_ELE);
                        CUSTOM_ALERTS('success', 'Operation Successfully 100%', data.msg);
                        window.location.reload()
                    } else if (data.status === 400) { return CUSTOM_ALERTS('warning', 'Error: Mistake Happened!', data.msg) } else { return CUSTOM_ALERTS('warning', 'OOPS!!', data.msg) }
                })
                return
            }
        })
    })
})
const BLOCK_BTNS = document.getElementsByClassName('block-btn');
const unindexed__block__btns = [...BLOCK_BTNS];
unindexed__block__btns.map(BLOCK_BTN => {
    BLOCK_BTN.addEventListener('click', () => {
        const block_id = BLOCK_BTN.getAttribute('data-id');
        swal({ title: "Are you sure?", text: "You wanna Block This User , Are You Agree ?", icon: "warning", buttons: !0, dangerMode: !0, }).then((willDelete) => {
            if (willDelete) {
                POST_DATA2(`${BASE_URL}${atob('L2FkbWluL2FwaS92MS9ibG9jaw==')}`, { id: block_id }, 'PUT').then(data => {
                    if (!data) { return alert('Server Response Empty!') }
                    if (data.status === 200) {
                        const TD_ELE = BLOCK_BTN.parentElement.parentElement;
                        TD_ELE.style.opacity = 0.5;
                        TD_ELE.style.cursor = 'not-allowed';
                        CUSTOM_ALERTS('success', 'User Blocked Successfully', data.msg);
                        window.location.reload()
                    } else if (data.status === 400) { return CUSTOM_ALERTS('warning', 'Error: Mistake Happened!', data.msg) } else { return CUSTOM_ALERTS('warning', 'OOPS', data.msg) }
                });
                return
            }
        })
    })
})
const UNBLOCK_BTNS = document.getElementsByClassName('unblock-btn');
const unindexed__unblock__btns = [...UNBLOCK_BTNS];
unindexed__unblock__btns.map(unblock_btn => {
    unblock_btn.addEventListener('click', () => {
        const target_btn_id = unblock_btn.getAttribute('data-id');
        swal({ title: "Are you sure?", text: "You wanna Unblock This User , Are you Agree ? ", icon: "warning", buttons: !0, dangerMode: !0, }).then((willDelete) => {
            if (willDelete) {
                POST_DATA2(`${BASE_URL}${atob('L2FkbWluL2FwaS92MS91bmJsb2Nr')}`, { id: target_btn_id }, 'PUT').then(data => {
                    if (!data) { return salert('Server Response Empty!') }
                    if (data.responseCode === 1) { CUSTOM_ALERTS('warning', 'Error Catched!', data.responseDesc) } else if (data.responseCode === 0) {
                        CUSTOM_ALERTS('success', 'Succsessfully 100%', data.responseDesc);
                        window.location.reload()
                    } else { return }
                });
                return
            }
        })
    })
})
const RV_BTNS = document.getElementsByClassName('rv-btn');
const btns__arr = [...RV_BTNS];
btns__arr.map(btn => {
    btn.addEventListener('click', () => {
        const btn_id = btn.getAttribute('data-id');
        const isOk = confirm('Are You Sure ? ');
        if (!isOk) { return }
        btn.style.opacity = 0.5;
        btn.style.cursor = 'not-allowed';
        btn.innerText = 'Removing...'
        fetch(`${BASE_URL}${atob('L2FkbWluL2FwaS92MS9yZW1vdmUvdXJs')}`, { method: 'DELETE', headers: { "Content-Type": "Application/json" }, body: JSON.stringify({ id: btn_id }) }).then(response => response.json()).then(data => {
            if (data === null || !data) { return alert('Empty Payload!!') }
            if (data.status === 200) {
                const TD_ELE = btn.parentElement.parentElement;
                TD_ELE.parentNode.removeChild(TD_ELE);
                alert(data.msg)
            } else if (data.status === 400) {
                btn.style.opacity = 1;
                btn.style.cursor = 'pointer';
                btn.innerText = 'Remove'
                alert(data.msg);
                return
            } else {
                btn.style.opacity = 1;
                btn.style.cursor = 'pointer';
                btn.innerText = 'Remove'
                alert(data.msg)
            }
        })
    })
})
const forgotForm = document.getElementById('forgot_pass');
$('#forgot_pass').submit((e) => {
    e.preventDefault();
    const email = $('#email_input').val();
    const captcha = $('#g-recaptcha-response').val();
    if (!validator.isEmail(email)) { return alert('E-mail Field  Must Be Valid !') }
    fetch(`${BASE_URL}/api/auth/forgot-password`, { method: "POST", headers: { "Content-Type": "Application/json" }, body: JSON.stringify({ email: email, captcha: captcha }) }).then(response => response.json()).then(data => {
        if (data.responseCode === 1) {
            if (data.confirmation === 'warning') {
                alertWarning.classList.add('show_warning');
                setTimeout(() => { alertWarning.classList.remove('show_warning') }, 5000);
                return
            }
            alertDanger.classList.add('show_danger');
            setTimeout(() => { alertDanger.classList.remove('show_danger') }, 5000)
        }
        if (data.status === 200) { forgotForm.insertAdjacentHTML('afterbegin', `<p class="success_block_bx">${data.msg}</p>`) } else if (data.status === 400) { forgotForm.insertAdjacentHTML('afterbegin', `<p class="alert_block_bx">${data.msg}</p>`); return alert('E-mail Field Must Be Valid') } else { forgotForm.insertAdjacentHTML('afterbegin', `<p class="alert_block_bx">${data.msg}</p>`) }
    })
})
$('#reset_pass').submit((e) => {
    e.preventDefault();
    const USER_ID = document.getElementById('user_id').getAttribute('data-id');
    const PASS_VAL = $('#pass_input').val();
    const captcha = $('#g-recaptcha-response').val();
    if (validator.isLength(PASS_VAL, 6)) { return alert('Password Provided is too short! Must Be More Than 6 Characters') }
    fetch(`${BASE_URL}/api/auth/reset-password`, { method: "PUT", headers: { "Content-Type": "Application/json" }, body: JSON.stringify({ password: PASS_VAL, id: USER_ID, captcha: captcha }) }).then(response => response.json()).then(data => {
        if (data.responseCode === 1) {
            if (data.confirmation === 'warning') {
                alertWarning.classList.add('show_warning');
                setTimeout(() => { alertWarning.classList.remove('show_warning') }, 5000);
                return
            }
            alertDanger.classList.add('show_danger');
            setTimeout(() => { alertDanger.classList.remove('show_danger') }, 5000)
        }
        if (data.status === 200) {
            alert(data.msg);
            window.location = '/login'
        } else { alert(data.msg) }
    })
})
const short_btn = document.querySelector('.short_btn');
$('#url_form').submit(e => {
    e.preventDefault();
    short_btn.style.opacity = 0.4;
    short_btn.innerText = 'Shorting...';
    short_btn.style.cursor = 'not-allowed';
    const unindexed_arr = $('#url_form').serializeArray();
    let data = {};
    $.map(unindexed_arr, function (j, i) { data[j.name] = j.value });
    POST_DATA2(`${BASE_URL}/v1/api/new`, data, 'POST').then(data => {
        short_btn.style.opacity = 1;
        short_btn.innerText = 'SHORT URL';
        short_btn.style.cursor = 'pointer';
        if (data) {
            if (data.status === 201) { swal({ title: 'URL SHORTED SUCCESSFULLY', text: data.respondeDesc, icon: 'success', button: "GOT IT" }).then(v => { if (v) { window.location = '/short-url' } else { window.location = '/short-url' } }) } else if (data.status === 400) { CUSTOM_ALERTS('warning', 'Oppps!', data.respondeDesc); return } else if (data.status === 403) {
                CUSTOM_ALERTS('warning', 'You are blocked!', data.respondeDesc);
                window.location = '/';
                return
            } else { return null }
        }
    })
});



// GET TOTAL VISITS 
const totalVisits = document.getElementById('totalVisits');
(async function () {
    // IF VISITS HITs: 1000 --> MAKE IT --> 1K , and so on , until hits 1M or more
    const API_END = 'https://api.countapi.xyz/get/snaplink.link/snaplink';
    await fetch(API_END).then(res => res.json()).
        then(data => {
            totalVisits.innerText = data.value;
        })
})();


// START REDDERING COMPAIGNS 
/*(async function () {
    const API_ENDPOINT = "L2FwaS92MS9jbGllbnQvYWRz";
    await fetch(`${BASE_URL}${atob(API_ENDPOINT)}`).then(res => res.json())
        .then(data => {
            if (data.status == 200) {
                const compaigns_container = document.getElementById('compaigns-container');
                if (!data.compaigns.length > 0) {
                    // DISPLAY A DEFAULT BANNER OF SNAPLINK
                    compaigns_container.append('Free Compaign Available')
                    return;
                }
                data.compaigns.map(cn => {

                    // CREATE NEW DOM ELEMENTS
                    const compaign_div = document.createElement('div');
                    const ad_close = document.createElement('div');
                    const snp_default_ad = document.createElement('div');
                    const snp_ad_logo = document.createElement('div');
                    const snp_logo_img = document.createElement('img');
                    const snp_ad_link = document.createElement('a');
                    const snp_close_icon = document.createElement('i');
                    const ad_url = document.createElement('a');
                    const ad_poster = document.createElement('img');

                    compaign_div.setAttribute('class', 'ad_poster_holder');
                    compaign_div.setAttribute('title', cn.title);
                    ad_url.setAttribute('href', cn.url);
                    ad_url.setAttribute('target', '_blank');
                    ad_poster.setAttribute('src', cn.banner);
                    ad_poster.setAttribute('alt', cn.title);
                    ad_poster.setAttribute('class', 'img-fluid');
                    // APPEND DOM ELEMENTS FOR DEFAULT AD BANNER
                    snp_close_icon.setAttribute('class', 'bx bxs-x-circle');
                    ad_close.setAttribute('class', 'ad-close-wrapper');
                    ad_close.appendChild(snp_close_icon);
                    snp_default_ad.setAttribute('class', 'snaplink-default-ad-banner bg-light');
                    snp_ad_logo.setAttribute('class', 'snaplink-ad-banner-logo');
                    snp_logo_img.setAttribute('src', '/svg/snapLink-logo.svg');
                    snp_logo_img.setAttribute('class', 'img-fluid');
                    snp_ad_link.setAttribute('href', '/advertising');

                    // ADDING NEW DOM ELEMENTS TO DEFAULT AD BANNER
                    snp_ad_link.append('SnapLink Free Ad Space');
                    snp_ad_logo.appendChild(snp_logo_img);
                    snp_default_ad.appendChild(snp_ad_logo);
                    snp_default_ad.appendChild(snp_ad_link);

                    // APPEND THE ELEMENT TO ROOT DOM ELEMENT (compaign-container)
                    ad_url.appendChild(ad_poster);
                    compaign_div.appendChild(ad_url);
                    compaign_div.appendChild(ad_close);
                    compaign_div.appendChild(snp_default_ad);
                    compaigns_container.append(compaign_div);
                })
            }
        })
})();*/

//const id_input = document.createElement('input'); id_input.type = "hidden"; id_input.name = "id"; id_input.value = data.id; const Verify_Token_Form = $('#verify_token_form'); Verify_Token_Form.insertAdjacentHTML('afterBegin', id_input);

// DISABLE CONTEXT MENU FUNCTION
/*document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
})*/
