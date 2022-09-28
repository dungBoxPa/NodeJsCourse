const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
            // validate: [validator.isPassword],
            minLength: 8,
            trim: true,
            select: false
        },
        role: {
            type: String,
            enum: ['user', 'guide', 'lead-guide', 'admin'],
            default: 'user'
        },
        passwordConfirm: {
            type: String,
            required: [true, 'Please confirm your password'],
            validate: {
                validator: function (el) {
                    return el === this.password;
                },
                message: "Password not match!"
            }
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        active: {
            type: Boolean,
            default: true,
            select: false
        },
        loginAttemp:{
            type: Number,
            select: false,
            default: 0,
        },
        NextLoginAttempt: {
            type: Date
        }
    }
);

userSchema.pre('save', async function (next) {
    // Only run this function if this password was actually modified
    if (!this.isModified('password')) {
        return next();
    } else {
        // Hash the password with the code 12 and delete password confirmation  
        this.password = await bcrypt.hash(this.password, 12);
        this.passwordConfirm = undefined;
    }
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) {
        next();
    }
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(changedTimeStamp, JWTTimestamp);
        return changedTimeStamp > JWTTimestamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log({ resetToken }, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}



const User = mongoose.model('User', userSchema);
module.exports = User;