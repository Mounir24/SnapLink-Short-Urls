const POST_DATA = async (url = '', data = {}, method = '') => {
    const response = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    return response.json()
}
// BASE URL: https://short-url-snaplink.herokuapp.com
const SNP_BASE_URL = 'http://localhost:4041';

// SWEET ALERT DIALOGS 
const SWEET_ALERTS = (type, name, desc) => {
    if (!type || !name || !desc) {
        alert(`${name}\n${desc}`)
        return;
    }

    switch (type) {
        case 'success':
            return swal({
                title: name,
                text: desc,
                icon: "success",
                button: "I Got It",
            });

        case 'warning':
            return swal({
                title: name,
                text: desc,
                icon: "warning",
                button: "I Got It",
            });
    }
}

// CREATE AN INSTANCE OF SELECTED BANNER IMAGE
const file_target = document.getElementById('ad-banner');
const BANNER_PREV_IMG = (event) => {
    if (event.target.files.length > 0) {
        let banner_src = URL.createObjectURL(event.target.files[0]);
        let banner_prev = document.getElementById('banner_img_src');

        // CHECK THE BANNER FILE SIZE 
        if (event.target.files[0].size > 500000) {
            console.log(event.target.files[0].size);
            //alert('FILE: ' + event.target.files[0].name + ' SIZE: ' + event.target.files[0].size);
            SWEET_ALERTS('warning', 'Upload Failed!', `FILE: ${event.target.files[0].name} - SIZE: ${event.target.files[0].size}`);
            return
        }

        // CHECK THE FILE MIME TYPE
        const allowed_mime_types = ['image/png', 'image/svg', 'image/jpeg'];
        if (!allowed_mime_types.includes(event.target.files[0].type)) {
            return SWEET_ALERTS('warning', 'UPLOAD FAILED', `FILE: ${event.target.files[0].name} - TYPE: ${event.target.files[0].type} Not allowed!`);
        }
        banner_prev.src = banner_src;
    }
};

file_target.addEventListener('change', BANNER_PREV_IMG);

// CREATE A SUBSCRIPTION PLAN API ENDPOINT
document.getElementById('plan_form').addEventListener('submit', (e) => {
    e.preventDefault();
    // GET FILE BANNER INPUT 
    const banner_file = document.getElementById('ad-banner').files[0];
    // SERIALIAZE FORM TARGET
    const unindexed_array_pl = $('#plan_form').serializeArray();
    // INITIAT ENCAPSULATE DATA OBJECT
    const data = {};
    $.map(unindexed_array_pl, (n) => {
        data[n['name']] = n.value
    });
    toBase64(banner_file).then(async BASE64 => {
        // APPEND BANNER FILE AS BASE64 FORMAT
        data['banner'] = BASE64;
        // SEND SUBSCRIPTIONS PLAN POST REQUEST 
        POST_DATA(`${SNP_BASE_URL}${atob('L2FwaS92MS9wbGFuX3JlcXVlc3Q=')}`, data, 'POST')
            .then(info => {
                if (info.confirmation === true) {
                    SWEET_ALERTS('success', 'Subscription Plan Requested!', `Your Subscription Plan: ${data['ad-budget']} Has Been requested , we\"ll review it soon!`)
                } else if (info.status === 400) {
                    SWEET_ALERTS('warning', 'REQUEST FAILED :(', 'ERROR: SOMETHING WENT WRONG WHILE REQUESTING SUBSCRIPTION PLAN!')
                    return;
                } else if (info.status === 500) {
                    SWEET_ALERTS('warning', info.errorMsg);
                } else {
                    SWEET_ALERTS('warning', 'Somthing Went Wrong', 'ERROR: SERVER FAILED TO HANDLE THE REQUEST!')
                }
            })
    })
})

// CREATE NEW AD API - (POST)
const toBase64 = FILE => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(FILE);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    })
};

// GET AD FORM ID 
document.getElementById('ad-form-btn').addEventListener('click', async () => {
    const fileInp = document.getElementById('ad-banner').files[0];
    const data = {};
    // SERIALIZE FORM
    const unindexed_array = $('#ad-mngr-form').serializeArray();
    // MAP THROUGH "UNINDEXED_ARRAY"
    $.map(unindexed_array, (n) => {
        data[n.name] = n.value;
    })
    // GET BANNER VALUE AND CONVERT TO BASE64 
    toBase64(fileInp).then(async BASE64 => {
        data['ad-banner'] = BASE64;
        console.log(data);
        // FLY THE POST REQUEST 
        /*await POST_DATA(`${SNP_BASE_URL}/admin/api/v1/ads/create`, data, 'POST').then(data => {
            if (data.status === 201) {
                alert('NEW COMPAIGN HAS BEEN ADDED 100%');
                console.log(data);
            }
        })*/
        await fetch(`${SNP_BASE_URL}${atob('L2FkbWluL2FwaS92MS9hZHMvY3JlYXRl')}`, {
            method: 'POST',
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(res => res.json()).then(data => {
            if (data.status === 201) {
                swal({
                    title: "New Compaign Added 100%",
                    text: data.msg,
                    icon: "success",
                    button: "I Got It",
                });
                // RELOAD THE CURRENT PAGE 
            } else {
                console.log('SOMETHING WENT WRONG :(')
            }
        })
    }).catch(err => {
        console.log(err);
    })
});

// BASE URL
/*const SNP_BASE_URL = 'http://localhost:4041';

// CREATE NEW AD API - (POST)
$('#ad-mngr-form').submit(async e => {
    e.preventDefault();
    // AD DATA OBJECT
    const data = {};
    // SERIALZE FORM
    const unindexed_array = $('#ad-mngr-form').serializeArray();
    const fileInput = document.getElementById('ad-banner');
    // MAP THROUGH "UNINDEXED ARRAY"
    $.map(unindexed_array, (n, i) => {
        data[n.name] = n.value
    });*/
/******************for base 64 *****************************/
/*(function () {
    var file = fileInput.files[0];
    var reader = new FileReader();
    reader.onloadend = function () {
        console.log('Encoded Base 64 File String:', reader.result);
        // APPEND FILE AS AD BANNER
        data.ad_banner = reader.result;*/
/******************* for Binary ***********************/
/*var data = (reader.result).split(',')[1];
var binaryBlob = atob(data);
console.log('Encoded Binary File String:', binaryBlob);*/
/*}
alert('FILE UNCODED SUCCESSFULLY 100%')
reader.readAsDataURL(file);
})();
// FLY THE POST REQUEST
console.log(data);
try {
await POST_DATA(`${SNP_BASE_URL}/admin/api/v1/ads/create`, data, 'POST')
    .then(data => {
        if (data.status === 201) {
            alert('COMPAIGN ADDED SUCCESSFULLY 100%');
            console.log(data.msg);
        } else {
            alert(data.errorMsg)
        }
    })
} catch (err) {
alert(err.message);
}
})*/
