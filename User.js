const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true }, // Trim whitespace and enforce uniqueness
    password: { type: String, required: true }
});

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
            this.password = await bcrypt.hash(this.password, salt); // Hash the password
            console.log('Password hashed:', this.password); // Debug log for hashing
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        const result = await bcrypt.compare(candidatePassword, this.password);
        console.log('Password comparison result:', result); // Debug log for comparison
        return result;
    } catch (error) {
        console.error('Error comparing password:', error);
        return false;
    }
};

module.exports = mongoose.model('User', userSchema);