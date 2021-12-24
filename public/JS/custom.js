// CUSTOM SNAPLINK JS FILE 
const settingsUpdate = document.getElementById('setting-update-btn');
// REQUEST FORM HELPER
const PostSettings = async (url = '', data, method = '') => {
    const response = await fetch(url, { method: method, headers: { "Content-Type": "Application/json" }, body: JSON.stringify(data) })
    return response.json()
}

$('#2-Factory').submit(async (e) => {
    e.preventDefault();
    // API ENDPOINT
    const API_ENDPOINT = 'http://localhost:8080/api/v1/settings';
    // GET FORM INPUT VALUES AS OBJECT
    const newSettingsObj = $('#2-Factory').serializeArray();
    // DATA OBJECT
    let settingObj = {};
    //ORGANIZE THE DATA OBJECT TO ARRAY FORMAT
    $.map(newSettingsObj, function (n, i) {
        settingObj[n.name] = n.value;
    })

    // POST THE CURRENT SETTINGS TO THE SERVER
    await PostSettings(API_ENDPOINT, settingObj, 'POST')
        .then(data => {
            if (data.success) {
                swal({
                    title: 'Profile Setting Updated!',
                    text: data.response,
                    icon: "success",
                    button: "I Got It",
                });
            } else {
                swal({
                    title: 'OOPS!',
                    text: 'Something Went Wrong While Updating Settings!',
                    icon: "warning",
                    button: "I Got It",
                });
            }
        })
})

