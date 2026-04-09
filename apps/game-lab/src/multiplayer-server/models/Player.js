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
        unlocked: {
            ships: {
                sloop: Boolean,
                brig: Boolean,
                frigate: Boolean,
            },
            weapons: {
                light: Boolean,
                heavy: Boolean,
                rapid: Boolean,
            },
            crew: {
                captain: Boolean,
                firstMate: Boolean,
                navigator: Boolean,
                gunner: Boolean,
            },
        },
    },
    ship: {
        id: String,
    },
    loadout: {
        cannons: [String],
        activeCannonSlot: Number,
    },
    crew: {
        gunner: Boolean,
        navigator: Boolean,
        firstMate: Boolean,
        captain: Boolean,
    },
    inventory: {
        gold: Number,
        wood: Number,
        metal: Number,
        scrap: Number,
        cloth: Number,
        tech: Number,
        powder: Number,
        gear: Number,
    },
});

module.exports = mongoose.model('Player', playerSchema);
        
    
    
