// GET VERIFY TOKEN ACCESS COOKIE
function GET_COOKIE() {
    // PLAN TO PARSE COOKIES
    const allCookies = document.cookie.split(';')[1];
    const uid_cookie = allCookies.substring(5);
    //console.log(uid_cookie4);
    return uid_cookie;
}

// FINAL UID COOKIE
const UID_COOKIE = GET_COOKIE();
const Verify_Token_Form = document.getElementById('verify_token_form');
Verify_Token_Form.insertAdjacentHTML('afterBegin', `<input type="hidden" id="uid" value="${UID_COOKIE.trim()}">`);

// VERIFY ACCESS TOKEN 
/*$('#verify_token_form').on('submit', (e) => {
    e.preventDefault();
    const Access_Token = $('#access_token').val();
    const User_Uid = $('#uid').val();
    console.log(`ACCESS TOKEN: ${Access_Token}\n UID: ${User_Uid}`);
    POST_DATA2(`${BASE_URL}/api/verify/token_access`, { token_access: Access_Token, uid: User_Uid }, 'POST')
        .then(data => {
            if (data.status === 200) {
                alert(data.msg);
                window.location = '/short-url';
            } else {
                alert('SOMETHING WENT WRONG!')
            }
        })
})*/

document.getElementById('verify_token_form').addEventListener('submit', (e) => {
    e.preventDefault();
    const Access_Token = $('#access_token').val();
    const User_Uid = $('#uid').val();
    // REMOVE THE CURRENT COOKIE 
    /*(function () {
        document.cookie = "SESSID=;";
        alert('CURRENT SESSID REMOVED FROM COOKIE STORAGE');
    })();*/
    console.log(`ACCESS TOKEN: ${Access_Token}\n UID: ${User_Uid}`);
    POST_DATA2(`${BASE_URL}/api/verify/token_access`, { token_access: Access_Token, uid: User_Uid }, 'POST')
        .then(data => {
            if (data.status === 200) {
                // SWAL ALERT
                swal({
                    title: 'Valid Token',
                    text: data.msgSuccess,
                    icon: "success",
                    button: "I Got It",
                }).then(v => {
                    if (v) {
                        window.location = '/short-url';
                        return;
                    }
                })

            } else {
                alert('SOMETHING WENT WRONG!')
            }
        })
});