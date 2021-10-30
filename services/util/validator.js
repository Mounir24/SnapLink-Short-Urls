const validator = {
    //IS EMPTY METHOD
    isEmpty(str) {
        if (str.trim() === '') {
            return true
        } else {
            return false
        }
    },

    // IS EMAIL METHOD
    isEmail(email) {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9]{2,4}$/;
        // CHECK IF EMAIL PROVIDED IS VALIDATE
        if (email.match(emailPattern)) {
            return true
        } else {
            return false;
        }
    },

    // IS LENGTH METHOD
    isLength(str, lng) {
        if (str.length < lng) {
            return true
        } else {
            return false
        }
    },

    // SET THE LENGTH MAX 
    isMax(str, max) {
        if (str.length > max) {
            return true;
        } else {
            return false;
        }
    }
}

module.exports = validator;