// IMAGE PREVIEW
// FILE INPUT TARGET
const fileInput = document.getElementById('customFile');

const IMG_PREVIEW = (event) => {
    if (event.target.files.length > 0) {
        let src = URL.createObjectURL(event.target.files[0]);
        let preview = document.getElementById('img__prv');
        // CHECK THE SIZE OF THE FILE LIMIT: (300K Bytes =  300 KO)
        if (event.target.files[0].size > 300000) {
            console.log(event.target.files[0])
            alert(`File: ${event.target.files[0].name} size is too big)!`)
            return;
        }
        preview.src = src;
    }
};

fileInput.addEventListener('change', IMG_PREVIEW);

/*----- END -----*/