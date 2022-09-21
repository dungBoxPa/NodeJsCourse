const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'User must have a name'],
            unique: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            validate: [validator.isEmail, 'Please provide a valid email!'],
            required: [true, 'User must hava an email!']
        },
        photo: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'User must have a password'],
            // validateL [validator.isPassword],
            minLength: 8,
            trim: true
        },
        passwordConfirm: {
            type: String,
            require: [true, 'Please confirm your password'],
            validate: {
                validator: function(el){
                    return el === this.password;
                },
                message: "Password not match!"
            }
        }
    }
);

userSchema.pre('save', async function(next){
    // Only run this function if this password was actually modified
    if(!this.isModified('password')){
        return next();
    }else{
        // Hash the password with the code 12 and delete password confirmation  
        this.password = await bcrypt.hash(this.password, 12);
        this.passwordConfirm = undefined;
    }
})

const User = mongoose.model('User', userSchema);
module.exports = User;