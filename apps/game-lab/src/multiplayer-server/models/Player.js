const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true, trim: true },
    email: { type: String, unique: true, required: true, trim: true, lowercase: true },
    passwordHash: String,
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },

    progression: {
        level: Number,
        xp: Number,
        talentPoints: Number,
        talents: {
            dmg: Number,
            hp: Number,
            speed: Number,
        },
    },
    ship: {
        id: String,
    },
    inventory: {
        gold: Number,
        wood: Number,
        metal: Number,
    },
});

module.exports = mongoose.model('Player', playerSchema);
        
    
    
